const { assert_queue } = require("../helper")
const { play_next } = require("../player")

module.exports = {
  info: {
    name: "next",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)
      queue.playing = true

      play_next(message)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (next): ${err}`)
    }
  },
}
