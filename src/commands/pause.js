const { assert_queue } = require("../helper")

module.exports = {
  info: {
    name: "pause",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (!!queue.connection) {
        queue.playing = false
        queue.connection.dispatcher.pause()
        message.channel.send("Ozy paused!")
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (pause): ${err}`)
    }
  },
}
