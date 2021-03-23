const { assert_queue } = require("../helper")

module.exports = {
  info: {
    name: "resume",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (queue.curr_pos != -1) {
        queue.playing = true
        queue.connection.dispatcher.resume()
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (resume): ${err}`)
    }
  },
}
