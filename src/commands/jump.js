const { assert_queue, invalid_number } = require("../helper")
const { play } = require("../player")

module.exports = {
  info: {
    name: "jump",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (args.length !== 1) {
        throw "Invalid arguments"
      }

      let new_pos = Number(args[0])

      if (invalid_number(new_pos, 0, queue.track.length + 1)) {
        message.channel.send(`${new_pos} is not a valid index to jump to`)
        return
      }

      if (queue.curr_pos === new_pos - 1) return

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
