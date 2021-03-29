const fs = require("fs")
const path = require("path")
const { COMMANDS_DIR, EVENTS_DIR } = require("../const")

module.exports = {
  info: {
    name: "reload",
  },

  run: async (client, message, args) => {
    try {
      if (!args || args.length < 1) {
        fs.readdir(`./src/${COMMANDS_DIR}/`, (err, files) => {
          if (err) throw err

          files.forEach((file) => {
            if (!file.endsWith(".js")) return

            let command_name = file.split(".")[0]

            if (!client.commands.has(command_name)) {
              let props = require(`./src/${COMMANDS_DIR}/${file}`)
              let command_name = file.split(".")[0]
              client.commands.set(command_name, props)
            }

            delete require.cache[require.resolve(`./${command_name}.js`)]

            client.commands.delete(command_name)
            const props = require(`./${command_name}.js`)
            client.commands.set(command_name, props)
          })
        })
        console.log(`commands have been reset`)

        fs.readdir(`./src/`, { withFileTypes: true }, (err, dirents) => {
          if (err) throw err

          const files = dirents
            .filter((dirent) => dirent.isFile())
            .map((dirent) => dirent.name)

          files.forEach((file) => {
            if (!file.endsWith(".js")) return

            const full_path = path.resolve(`./src/${file}`)
            delete require.cache[full_path]
          })
        })
        console.log(`srcs have been reset`)

        const netease_api_path = path.resolve(`./src/api/netease/api.js`)
        const youtube_api_path = path.resolve(`./src/api/youtube/api.js`)

        delete require.cache[netease_api_path]
        delete require.cache[youtube_api_path]
      } else {
        const command_name = args[0]

        if (!client.commands.has(command_name)) {
          return message.reply(`${command_name} is not a valid command`)
        }

        delete require.cache[require.resolve(`./${command_name}.js`)]

        client.commands.delete(command_name)
        const props = require(`./${command_name}.js`)
        client.commands.set(command_name, props)

        message.reply(`${command_name} has been reloaded`)
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (prev): ${err}`)
    }
  },
}
