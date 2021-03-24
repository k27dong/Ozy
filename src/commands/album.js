const {
  assert_queue,
  validate_args,
  parse_album_list,
  filter,
} = require("../helper")
const { search_album, extract_album_songs } = require("../api/netease/api")
const { NUM_EMOJI } = require("../const")
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

      message.channel
        .send(parse_album_list(search_results))
        .then(async (message) => {
          for (let i = 0; i < search_results.length; i++) {
            await message.react(NUM_EMOJI[i + 1])
          }

          message
            .awaitReactions(filter, {
              max: 1,
              time: 60000,
              errors: ["time"],
            })
            .then(async (collected) => {
              const reaction = collected.first()
              const album =
                search_results[NUM_EMOJI.indexOf(reaction.emoji.name) - 1]
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
