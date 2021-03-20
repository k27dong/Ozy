const { play_next } = require("../player")

module.exports = {
  info: {
    name: "next",
  },

  run: async (client, message, args) => {
    try {
      play_next(message)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (${this.info.name}): ${err}`)
    }
  },
}
