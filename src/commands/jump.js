const { assert_queue, validate_args } = require("../helper")
const { play } = require("../player")

module.exports = {
  info: {
    name: "jump",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (args.length !== 1) {
      }

      let new_pos = Number(args[0])
      if (
        isNaN(new_pos) ||
        !Number.isInteger(new_pos) ||
        new_pos <= 0 ||
        new_pos > queue.track.length
      ) {
        message.channel.send(`${new_pos} is not a valid index to jump to`)
        return
      }

      queue.curr_pos = new_pos - 1
      queue.playing = true
      message.channel.send(`jumped to: ${queue.track[queue.curr_pos].name}`)
      play(message)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (jump): ${err}`)
    }
  },
}
