const { assert_queue, shuffle } = require("../helper")

module.exports = {
  info: {
    name: "shuffle",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (queue.track.length > 1) {
        // shuffle every item after queue.curr_pos

        let to_be_shuffled = queue.track.slice(queue.curr_pos + 1, queue.length)
        let shuffled = shuffle(to_be_shuffled)

        Array.prototype.splice.apply(
          queue.track,
          [queue.curr_pos + 1, shuffled.length].concat(shuffled)
        )
      }
      message.react("✅")
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (shuffle): ${err}`)
    }
  },
}
