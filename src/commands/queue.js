const { assert_queue, display_track, invalid_number } = require("../helper")

module.exports = {
  info: {
    name: "queue",
    description: "q",
  },

  run: async (client, message, args) => {
    try {
      // add current pos
      // go back at most {back_amount}, go front at most {remain - 1 - back_amount}
      // tries to back to {remain}, tries to future to {remain}

      let queue = assert_queue(message)

      let track = queue.track
      let displayed_tracks = []
      let pos = queue.curr_pos > 0 ? queue.curr_pos : 0

      let remain = 20

      if (args.length >= 1) {
        if (args[0] === "full") {
          remain = queue.track.length
        } else {
          remain = Number(args[0])

          if (invalid_number(remain, 0, queue.track.length + 1)) {
            throw `${remain} is not a valid number`
          }
        }
      }

      let back_amount = ~~(remain * 0.3)

      if (track.length !== 0) {
        displayed_tracks.push({
          song: track[pos],
          pos: pos,
          curr: true,
        })
        remain--

        let go_back = pos > back_amount ? back_amount : pos
        for (let i = 1; i <= go_back; i++, remain--) {
          displayed_tracks.unshift({
            song: track[pos - i],
            pos: pos - i,
            curr: false,
          })
        }

        let go_front =
          track.length - pos - 1 > remain ? remain : track.length - pos - 1
        for (let i = 1; i <= go_front; i++, remain--) {
          displayed_tracks.push({
            song: track[pos + i],
            pos: pos + i,
            curr: false,
          })
        }

        for (; remain > 0 && go_back + 1 <= pos; remain--, go_back++) {
          displayed_tracks.unshift({
            song: track[pos - go_back - 1],
            pos: pos - go_back - 1,
            curr: false,
          })
        }

        for (
          ;
          remain > 0 && go_front + pos + 1 < track.length;
          remain--, go_front++
        ) {
          displayed_tracks.push({
            song: track[pos + go_front + 1],
            pos: pos + go_front + 1,
            curr: false,
          })
        }
      }

      message.channel.send(display_track(displayed_tracks))
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (queue): ${err}`)
    }
  },
}
