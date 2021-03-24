const {
  assert_queue,
  parse_playlist_list,
  invalid_number,
  reply_filter,
} = require("../helper")
const {
  get_user_playlist,
  get_songs_from_playlist,
} = require("../api/netease/api")
const { play } = require("../player")

module.exports = {
  info: {
    name: "playlist",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)
      if (!queue.user) {
        message.channel.send(`No user set!`)
      } else {
        let playlist = await get_user_playlist(queue.user.userId)
        message.channel.send(parse_playlist_list(playlist)).then(async () => {
          message.channel
            .awaitMessages((m) => reply_filter(m, message), {
              max: 1,
              time: 30000,
              errors: ["time"],
            })
            .then(async (collected) => {
              let selection = Number(collected.array()[0].content)

              if (invalid_number(selection, 0, playlist.length + 1)) {
                throw `${selection} is not a valid selection`
              }

              let selected_playlist = playlist[selection - 1]
              let songs = await get_songs_from_playlist(selected_playlist)

              if (songs.length > 0) {
                for (let song of songs) {
                  queue.track.push(song)
                }
                message.channel.send(
                  `**Queued** ${songs.length} song${
                    songs.length > 1 ? "s" : ""
                  } from ${selected_playlist.name}`
                )

                if (!queue.playing) {
                  queue.playing = true
                  queue.curr_pos = queue.track.length - songs.length
                  play(message)
                }
              } else {
                message.channel.send(`No songs to be added`)
              }
            })
            .catch((err) => {
              console.error(err)
            })
        })
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (playlist): ${err}`)
    }
  },
}
