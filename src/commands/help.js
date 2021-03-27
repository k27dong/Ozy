const { FULL_COMMAND_LIST, HELP } = require("../help_msg")
const { formulate_command } = require("../helper")

module.exports = {
  info: {
    name: "help",
  },

  run: async (client, message, args) => {
    try {
      if (args.length === 0) {
        message.channel.send(FULL_COMMAND_LIST)
      } else {
        let command = formulate_command(args[0])

        if (!HELP[command]) {
          message.channel.send(`${command} is not a valid command!`)
        } else {
          message.channel.send(HELP[command])
        }
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (help): ${err}`)
    }
  },
}
