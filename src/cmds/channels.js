async function channels (msg, args = [], db) {
  switch (args.shift()) {
    case 'on':
    case 'enable':
    case 'set':
    case 'add': {
      const channel = await getChannel(msg, args)
      if (!channel) return msg.channel.send(':x: That is not a valid channel')

      if (!checkPermission(msg, channel)) return msg.channel.send(':x: You must have `MANAGE_CHANNELS` to use this command')

      if (channel.type !== 'news') return msg.channel.send(':x: You can only add announcement channels to the autopublish list!')

      if (await db.checkForChannel(msg.guild.id, channel.id)) return msg.channel.send(':x: That channel has already been added to the autopublish list!')

      const a = await db.addChannel(msg.guild.id, channel.id)

      if (!a.result.ok) return msg.channel.send(':x: aaaaaaaaaaaaaaa I don\'t know what happened! Please try again :)')
      if (a.result.nModified === 1) return msg.channel.send(`:white_check_mark: Added channel with id: \`${channel.id}\` to the autopublish list`)
      else return msg.channel.send(':x: Unable to add channel to autopublish list')
    }
    case 'off':
    case 'disable':
    case 'delete':
    case 'remove': {
      const channel = await getChannel(msg, args)
      if (!channel) return msg.channel.send(':x: That is not a valid channel')

      if (!checkPermission(msg, channel)) return msg.channel.send(':x: You must have `MANAGE_CHANNELS` to use this command')

      if (!await db.checkForChannel(msg.guild.id, channel.id)) return msg.channel.send(':x: That channel is not on the autopublish list')

      const a = await db.removeChannel(msg.guild.id, channel.id)

      if (!a.result.ok) return msg.channel.send(':x: aaaaaaaaaaaaaaa I don\'t know what happened! Please try again :)')
      if (a.result.nModified === 1) return msg.channel.send(`:white_check_mark: Removed channel with id: \`${channel.id}\` from the autopublish list`)
      else return msg.channel.send(':x: Unable to remove channel from autopublish list')
    }
    case 'list':
    default: {
      const guild = await db.getGuild(msg.guild.id)

      const channels = []

      for (const channel of guild.channels) channels.push(await getChannel(msg, [channel]))

      const mapped = channels.map((c) => `#${c.name} (${c.id})`)

      if (!mapped.length) return msg.channel.send(':x: There are no configured channels on the autopublish list.')

      msg.channel.send('```\n' + mapped.filter(Boolean).join('\n') + '```', {
        split: {
          append: '```\n',
          prepend: '```'
        }
      })
    }
  }
}

async function getChannel (msg, args) {
  let channel = msg.channel

  if (args[0]) {
    channel = msg.mentions.channels.first() ||
        msg.guild.channels.cache.find((c) => c.id === args[0] ||
        c.name.toLowerCase() === args.join('-').toLowerCase()) ||
        null
  }
  return channel
}

function checkPermission (msg, channel) {
  return channel.permissionsFor(msg.member).has('MANAGE_CHANNELS')
}

module.exports = { channels }
