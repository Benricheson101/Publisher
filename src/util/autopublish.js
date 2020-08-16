const CLOCK = '⏲️'
const MEGAPHONE = '📢'
const EXCLAMATION = '❗'
const ROTATING_LIGHT = '🚨'

async function autopublish (msg) {
  if (
    !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES') ||
    !msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')
  ) return react(msg, ROTATING_LIGHT)

  const a = await msg.client.api.channels(msg.channel.id).messages(msg.id).crosspost().post()

  if (a?.message === 'You are being rate limited.') return await react(msg, CLOCK)
  if (a?.id === msg.id) return await react(msg, MEGAPHONE)
  if (a?.code === 40033) return await react(msg, EXCLAMATION)
}

function react (msg, emoji) {
  if (!msg.channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS')) return
  return msg.react(emoji)
    .then((r) => setTimeout(() => r.remove(), 2000))
}

module.exports = {
  autopublish
}
