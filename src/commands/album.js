const {
  assert_queue,
  validate_args,
  parse_album_list,
  invalid_number,
  reply_filter,
} = require("../helper")
const { search_album, extract_album_songs } = require("../api/netease/api")
const { play } = require("../player")

module.exports = {
  info: {
    name: "album",
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

      let search_results = await search_album(keywords)

      message.channel.send(parse_album_list(search_results)).then(async () => {
        message.channel
          .awaitMessages((m) => reply_filter(m, message), {
            max: 1,
            time: 30000,
            errors: ["time"],
          })
          .then(async (collected) => {
            let selection = Number(collected.array()[0].content)

            if (invalid_number(selection, 0, search_results.length + 1)) {
              message.channel.send(`${selection} is not a valid selection`)
              throw `${selection} is not a valid selection`
            }

            const album = search_results[selection - 1]
            play_message = `Queued all songs from ${album.name}`

            let album_songs = await extract_album_songs(album)

            for (let song of album_songs) {
              queue.track.push(song)
            }
            message.channel.send(play_message)

            // if not playing, start playing the first song from the album
            if (!queue.playing) {
              queue.playing = true
              queue.curr_pos = queue.track.length - album_songs.length
              play(message)
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (album): ${err}`)
    }
  },
}
