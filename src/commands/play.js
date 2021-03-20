const { assert_queue, validate_args } = require("../helper")
const { get_first_song_result } = require("../api")
const { play } = require("../player")

module.exports = {
  info: {
    name: "play",
    description: "search for a song and add the first result to the track",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)
      validate_args(args)

      let keywords = ""
      let play_message = ""
      for (let word of args) {
        keywords += `${word} `
      }

      let song = await get_first_song_result(keywords)
      if (!!song) {
        queue.track.push(song)
        if (song.source === "netease") {
          play_message = `**Queued**: ${song.name} (${song.ar.name})`
        }
        message.channel.send(play_message)
      } else {
        throw "Can't seem to find this song"
      }

      if (!queue.playing) {
        queue.playing = true
        queue.curr_pos = queue.track.length - 1
        play(message)
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (${this.info.name}): ${err}`)
    }
  },
}
