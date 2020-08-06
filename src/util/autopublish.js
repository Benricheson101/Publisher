const fetch = require('node-fetch')

const CLOCK = '⏲️'
const MEGAPHONE = '📢'
const EXCLAMATION = '❗'

async function autopublish (msg) {
  if (!msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES')) return // do something

  const a = await fetch(`https://discord.com/api/v6/channels/${msg.channel.id}/messages/${msg.id}/crosspost`, {
    method: 'post',
    headers: {
      Authorization: `Bot ${msg.client.token}`
    }
  })
    .then((a) => a.json())

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
