const { assert_queue, parse_duration } = require("../helper")
const { play } = require("../player")
const { SUPPORTED_AUDIO_FORMAT } = require("../const")
const mm = require("music-metadata")
const fetch = require("node-fetch")

module.exports = {
  info: {
    name: "playfile",
  },

  run: async (client, message, args) => {
    try {
      if (message.attachments.array().length !== 1) {
        message.channel.send(`No files attached!`)
        return
      }

      let file = message.attachments.array()[0]

      if (!SUPPORTED_AUDIO_FORMAT.includes(file.name.split(".").pop())) {
        message.channel.send(
          `${file.name.split(".").pop()} files are not supported!`
        )
        return
      }

      let queue = assert_queue(message)
      let play_message = ""

      fetch(file.url).then(async (res) => {
        const metadata = await mm.parseStream(res.body)
        // console.log(metadata)

        let song = {
          name: !!metadata.common.title ? metadata.common.title : "未知歌曲",
          id: null,
          ar: {
            name: !!metadata.common.artist
              ? metadata.common.artist
              : "未知艺术家",
            id: null,
          },
          al: {
            name: !!metadata.common.album ? metadata.common.album : "未知专辑",
            id: null,
          },
          source: "uploaded_audio",
          url: file.url,
          duration: parse_duration(metadata.format.duration),
        }

        queue.track.push(song)
        play_message = `**Queued**: ${song.name} (${song.ar.name})`
        message.channel.send(play_message)

        if (!queue.playing) {
          queue.playing = true
          queue.curr_pos = queue.track.length - 1
          play(message)
        }
      })
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (playfile): ${err}`)
    }
  },
}
