const Discord = require('discord.js')

const client = new Discord.Client()
let channel

const newHost = () => {
  try {
    client.once('ready', () => {
      channel = client.channels.cache.get('793029475461496842')
    })

    client.login(process.env.DISCORD_TOKEN)
  } catch (error) {
    console.log('🚀 ~ newHost ~ error', error)
  }
}

export { newHost, channel }
