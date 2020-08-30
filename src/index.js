require('dotenv/config')
const { Client, Intents, MessageEmbed } = require('discord.js')
const { constants } = require('./util')
const { Database } = require('./Database')
const { channels } = require('./cmds/channels')
const { autopublish } = require('./util/autopublish')
const ms = require('ms')
const { inspect } = require('util')

const db = new Database('publisher', process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

db.connect()
  .then(() => console.log('Connected to MongoDB!'))
  .catch(console.error)

const client = new Client({
  allowedMentions: [],
  ws: {
    intents: new Intents([
      'GUILD_MESSAGES',
      'GUILDS'
    ])
  }
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} (${client.user.id})`)
})

client.on('message', async (msg) => {
  let g = await db.getGuild(msg.guild.id)

  if (!g) {
    g = Database.guildDoc(msg.guild.id)
    await db.addGuild(g)
  }

  const cmd = constants.REGEX.PARSE_CMD(client).exec(msg.content)

  if (!cmd) {
    if (msg.channel.type !== 'news') return

    if (
      !await db.checkForChannel(msg.guild.id, msg.channel.id) ||
      msg.author.id === client.user.id
    ) return

    await autopublish(msg)
      .catch(console.error)

    return
  }

  if (msg.author.bot) return

  const command = cmd.groups.command.trim().toLowerCase()
  const args = cmd.groups.args?.split(' ')

  switch (command) {
    case 'p':
    case 'publish': {
      if (!args) return msg.channel.send(':x: You must provide either a link or id of the message you would like to publish.')

      const [m, c] = await getMsg(msg, args[0])

      if (m.guild.id !== msg.guild.id) return

      if (!m) return msg.channel.send(':x: That message does not exist. If you are using a message ID, try using a message link instead.')

      if (c.type !== 'news') return msg.channel.send(':x: That message was not sent in an announcement channel.')

      if (
        !m.guild.me.permissionsIn(c).has('MANAGE_MESSAGES') ||
        !m.guild.me.permissionsIn(c).has('SEND_MESSAGES')
      ) {
        return await msg.channel.send(':x: I do not have permission to publish messages. Please make sure I have both `SEND_MESSAGES` and `MANAGE_MESSAGES`')
          .then((m) => m.delete({ timeout: 5000 }))
      }

      if (
        (m.author.id !== msg.author.id && !msg.member.permissionsIn(c).has('MANAGE_MESSAGES'))
      ) {
        return await msg.channel.send(':x: You do not have permission to use this command. You must have `MANAGE_MESSAGES` to publish another user\'s message, or `SEND_MESSAGESE` to send your own message.')
          .then((m) => m.delete({ timeout: 5000 }))
      }

      const a = await client.api.channels(msg.channel.id).messages(m.id).crosspost().post().catch((e) => Promise.resolve(e))

      if (a?.code === 40033) return msg.channel.send(':x: This message has already been published!')
      if (a?.message === 'You are being rate limited.') return msg.channel.send(`:x: You are being rate limited. Try again in ${ms(a?.retry_after)}`)
      if (a?.id === m.id) return msg.channel.send(`:white_check_mark: Successfully published message with id \`${m.id}\``)
      return msg.channel.send(`:question: Something happened and I don't know what! If this keeps happening, please join the support server (${client.user} support).

\`Response:\`
\`\`\`js
${inspect(a).substring(0, 1900)}
\`\`\`
`)
    }
    case 'h':
    case 'commands':
    case 'help': {
      return msg.channel.send({
        embed: new MessageEmbed()
          .addField('publish <msg_link|msg_id>', `
> **Description**: Manually publish a message
> **User Permission**: \`MANAGE_MESSAGES\`
> **Alias**: \`p\`
        `)
          .addField('autopublish [add|remove [channel]]', `
> **Description**: Edit channels on the autopublish list
> **Info**: When you post a message in an autopublish channel, the bot will react with a reaction for 2 seconds:
> :loudspeaker: - The message was successfully published
> :timer: - The bot has already published 10 messages in the last hour
> :exclamation: - The message was already published
> :rotating_light: - The bot does not have permission to publish the messages (see below)
> **Bot Permissions**: \`SEND_MESSAGES\` and \`MANAGE_MESSAGES\`
> **User Permission**: \`MANAGE_CHANNELS\`
> **Alias**: \`auto\`
        `)
          .addField('invite', `
> **Description**: Invite the bot
        `)
          .addField('support', `
> **Description**: Join the support server
        `)
          .setColor('#e38100')
      })
    }
    case 'support': {
      return msg.channel.send(`You can join the support server here: https://discord.gg/${constants.SUPPORT}`)
    }
    case 'invite': {
      return msg.channel.send(`<https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=${constants.PERMISSIONS}&scope=bot>`)
    }
    case 'auto':
    case 'autopublish':
    case 'channel':
    case 'channels': {
      channels(msg, args, db)
        .catch(console.error)
    }
  }
})

client.login(process.env.TOKEN)
  .catch(console.error)

async function getMsg (msg, arg) {
  const get = async (m, c) => {
    return new Promise((resolve) => {
      msg.client.channels.fetch(c)
        .then((ch) => {
          if (!ch) {
            resolve([null, null])
            return
          }

          const ms = ch.messages.cache.get(m)
          if (ms) {
            resolve([ms, ch])
            return
          }

          ch.messages.fetch(m)
            .then((abc) => resolve([abc, ch]))
            .catch(() => resolve([null, ch]))
        })
    })
  }

  let foundMsg
  const parsedUrl = constants.REGEX.MSG_URL.exec(arg)

  if (parsedUrl) foundMsg = await get(parsedUrl.groups?.message, parsedUrl.groups?.channel)
  else foundMsg = await get(arg, msg.channel.id)
  return foundMsg
}
