const Discord = require("discord.js")
const fs = require("fs")
const { login } = require("./src/api/netease/api")
const { EVENTS_DIR, COMMANDS_DIR } = require("./src/const")
// const CONFIG = require("./config.json")

const CONFIG = {
  COUNTRYCODE: process.env.countrycode,
  PASSWORD: process.env.password,
  PHONENUM: process.env.phonenum,
  BOT_TOKEN: process.env.bot_token,
  PREFIX: process.env.prefix
}

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.config = CONFIG
client.queue = new Map()
client.cookie = undefined

if (!!CONFIG.COUNTRYCODE && !!CONFIG.PASSWORD && !!CONFIG.PHONENUM) {
  login(CONFIG).then((result) => {
    client.cookie = result.cookie
  })
}

fs.readdir(`./src/${EVENTS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    if (!file.endsWith(".js")) return

    const event = require(`./src/${EVENTS_DIR}/${file}`)
    let eventName = file.split(".")[0]
    console.log(`loading event: ${eventName}`)
    client.on(eventName, event.bind(null, client))
  })
})

fs.readdir(`./src/${COMMANDS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    if (!file.endsWith(".js")) return

    let props = require(`./src/${COMMANDS_DIR}/${file}`)
    let command_name = file.split(".")[0]
    console.log(`loading command: ${command_name}`)
    client.commands.set(command_name, props)
  })
})

client.login(CONFIG.BOT_TOKEN)
