const { token, dev_guild } = require("./config.json")
const fs = require("fs")
const { Client, Collection, Intents } = require("discord.js")


const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

client.commands = new Collection()
client.queue = new Map()

/** refresh command list  */
const guild = client.guilds.cache.get(dev_guild)
client.commands.set([])
if (!!guild) guild.commands.set([])

const command_files = fs
  .readdirSync("./src/commands")
  .filter((f) => f.endsWith(".js"))

const event_files = fs
  .readdirSync("./src/events")
  .filter((f) => f.endsWith(".js"))

for (const f of command_files) {
  const command = require(`./src/commands/${f}`)
  client.commands.set(command.data.name, command)

  console.log(command.data.name)
}

for (const f of event_files) {
  const event = require(`./src/events/${f}`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }

}

client.login(token)
