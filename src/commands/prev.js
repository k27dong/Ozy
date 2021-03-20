const { assert_queue } = require("../helper")
const { play_prev } = require("../player")

module.exports = {
  info: {
    name: "prev",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)
      queue.playing = true

      play_prev(message)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (prev): ${err}`)
    }
  },
}
