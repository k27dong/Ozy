const { assert_queue } = require("../helper")

module.exports = {
  info: {
    name: "clear",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      queue.track = []
      queue.curr_pos = -1
      queue.playing = false

      if (!queue.connection) return
      if (!queue.connection.dispatcher) return

      queue.connection.dispatcher.end()
      message.react("✅")
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (${this.info.name}): ${err}`)
    }
  },
}
