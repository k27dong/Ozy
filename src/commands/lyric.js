const { get_raw_lyric_by_id } = require("../api")
const { assert_queue, parse_lrc } = require("../helper")

module.exports = {
  info: {
    name: "lyric",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (queue.playing) {
        const raw_lrc = await get_raw_lyric_by_id(
          queue.track[queue.curr_pos].id
        )
        message.channel.send(parse_lrc(raw_lrc))
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (${this.info.name}): ${err}`)
    }
  },
}
