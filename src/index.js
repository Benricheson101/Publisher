import 'dotenv/config.js'
import { Client, Intents, MessageEmbed } from 'discord.js'
import { constants } from './config.js'
import fetch from 'node-fetch'
import ms from 'ms'

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
  const cmd = constants.REGEX.PARSE_CMD(client).exec(msg.content)

  if (
    msg.author.bot ||
    !cmd
  ) return

  const command = cmd.groups.command.trim().toLowerCase()
  const args = cmd.groups.args?.split(' ')

  switch (command) {
    case 'p':
    case 'publish': {
      const m = await getMsg(msg, args[0])

      if (!m) return msg.channel.send(':x: That message does not exist.')
      if (m.channel.type !== 'news') return msg.channel.send(':x: That message was not sent in an announcement channel.')

      if (
        !msg.guild.me.permissions.has('MANAGE_MESSAGES') ||
      !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES')
      ) {
        return await msg.channel.send(':x: I do not have permission to publish messages. Please make sure I have `MANAGE_MESSAGES`')
          .then((m) => m.delete({ timeout: 5000 }))
      }

      if (!msg.member.permissionsIn(m.channel).has('MANAGE_MESSAGES')) {
        return await msg.channel.send(':x: You do not have permission to use this command. You must have `MANAGE_MESSAGES`')
          .then((m) => m.delete({ timeout: 5000 }))
      }
      if (!args) return msg.channel.send(':x: You must provide either a link or id of the message you would like to publish.')

      const a = await fetch(`https://discord.com/api/v6/channels/${m.channel.id}/messages/${m.id}/crosspost`, {
        method: 'post',
        headers: {
          Authorization: `Bot ${client.token}`
        }
      })
        .then((a) => a.json())

      if (a?.code === 40033) return msg.channel.send(':x: This message has already been published!')
      if (a?.message === 'You are being rate limited.') return msg.channel.send(`:x: You are being rate limited. Try again in ${ms(a?.retry_after)}`)
      if (a?.id === m.id) return msg.channel.send(`:white_check_mark: Successfully published message with id \`${m.id}\``)
      return msg.channel.send(':question: Something happened and I don\'t know what!')
    }
    case 'h':
    case 'commands':
    case 'help': {
      return msg.channel.send({
        embed: new MessageEmbed()
          .addField('Publish', `
**Description**: Publishes a message
**Usage**: \`publish <msg_url|msg_id>\`,
**User Permission**: \`MANAGE_MESSAGES\`
**Commands**:
\`p\`
\`publish\`
        `)
          .addField('Help', `
**Description**: Get a list of commands
**Commands**:
\`h\`
\`help\`
\`commands\`
        `)
          .addField('Invite', `
**Description**: Invite the bot
        `)
          .addField('Support', `
**Description**: Join the support server
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
  }
})

client.login(process.env.TOKEN)
  .catch(console.error)

async function getMsg (msg, arg) {
  const get = async (m, c) => {
    return new Promise((resolve) => {
      const ms = msg.guild.channels.cache.get(c).messages.cache.get(m)
      if (ms) {
        resolve(ms)
        return
      }
      msg.guild.channels.cache.get(c).messages.fetch(m).then(resolve).catch(() => resolve(null))
    })
  }

  let foundMsg
  const parsedUrl = constants.REGEX.MSG_URL.exec(arg)

  if (parsedUrl) foundMsg = await get(parsedUrl.groups?.message, parsedUrl.groups?.channel)
  else foundMsg = foundMsg = await get(arg, msg.channel.id)
  return foundMsg
}
