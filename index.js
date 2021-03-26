const Discord = require("discord.js")
const fs = require("fs")
const { login } = require("./src/api/netease/api")
const { EVENTS_DIR, COMMANDS_DIR } = require("./src/const")
const CONFIG = require("./config.json")

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.config = CONFIG
client.queue = new Map()
client.cookie = undefined

login(CONFIG).then((result) => {
  client.cookie = result.cookie
})

fs.readdir(`./src/${EVENTS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    const event = require(`./src/${EVENTS_DIR}/${file}`)
    let eventName = file.split(".")[0]
    client.on(eventName, event.bind(null, client))
  })
})

fs.readdir(`./src/${COMMANDS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    if (!file.endsWith(".js")) return

    let props = require(`./src/${COMMANDS_DIR}/${file}`)
    let command_name = file.split(".")[0]
    process.stdout.write(`Loading: ${command_name}`)
    client.commands.set(command_name, props)
    console.log(`\t\t ... done`)
  })
})

client.login(CONFIG.BOT_TOKEN)
