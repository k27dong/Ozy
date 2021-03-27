const { assert_queue, validate_args, is_url, is_youtube } = require("../helper")
const { get_first_song_result } = require("../api/netease/api")
const { get_audio_from_raw_url } = require("../api/youtube/api")
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

      if (!message.member.voice.channel) {
        message.channel.send(`You're not in any voice channel!`)
        return
      }

      let method = "netease"
      let keywords = ""
      let play_message = ""
      let song
      let flag = false

      if (args.length === 1 && is_url(args[0])) {
        if (is_youtube(args[0])) {
          method = "youtube_url"
          keywords = args[0]
        } else {
          message.channel.send(`This format of url is not supported!`)
          return
        }
      } else {
        for (let word of args) {
          if (word[0] === "-") {
            if (!flag) {
              word = word.slice(1, word.length)
              switch (word) {
                case "y":
                case "y2b":
                case "youtube":
                  method = "youtube"
                  break
                case "n":
                case "net":
                case "netease":
                  method = "netease"
                  break
                case "s":
                case "spotify":
                default:
                  break
              }
            } else {
              message.channel.send(`Cannot include more than one flag!`)
              return
            }
          } else {
            keywords += `${word} `
          }
        }
      }

      switch (method) {
        case "netease":
          song = await get_first_song_result(keywords)
          break
        case "youtube_url":
          song = await get_audio_from_raw_url(keywords)
          break
        case "youtube":
          break
        case "spotify":
          break
        case "b23":
          break
        default:
          break // should never get here
      }

      if (!!song) {
        queue.track.push(song)
        if (song.source === "netease" || song.source === "youtube_url") {
          play_message = `**Queued**: ${song.name} ${
            !!song.ar.name ? `(${song.ar.name})` : ""
          }`
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
      message.channel.send(`Error (play): ${err}`)
    }
  },
}
