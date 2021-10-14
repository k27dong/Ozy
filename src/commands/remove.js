const { assert_queue, invalid_number } = require("../helper")
const { sortedUniq } = require("lodash")

module.exports = {
  info: {
    name: "remove",
  },

  run: async (client, message, args) => {
    const valid_index = (index, message) => {
      let queue = assert_queue(message)

      if (invalid_number(index, 0, queue.track.length + 1)) {
        message.channel.send(`${index} is not a valid index!`)
      }

      return !invalid_number(index, 0, queue.track.length + 1)
    }

    try {
      let queue = assert_queue(message)

      let removing_index = []
      for (let i of args) {
        // if there are more than one indexs to be removed (ex: 1 -> 10)
        if (i.replace(/[^\->]/g, "").length === 2) {
          let new_index = i.split("->")
          if (new_index.length === 2) {
            let left = Number(new_index[0])
            let right = Number(new_index[1])

            if (
              valid_index(left, message) &&
              valid_index(right, message) &&
              left < right
            ) {
              for (let pointer = left; pointer <= right; pointer++) {
                removing_index.push(pointer)
              }
            }
          } else {
            message.channel.send(`${i} is not a valid index!`)
            return
          }
        } else {
          let new_index = Number(i)
          if (valid_index(new_index, message)) {
            removing_index.push(new_index)
          }
        }
      }

      removing_index = sortedUniq(removing_index.sort())

      for (
        let curr_index = removing_index.length - 1;
        curr_index >= 0;
        curr_index--
      ) {
        let to_be_removed = removing_index[curr_index] - 1
        if (to_be_removed === queue.curr_pos) {
          message.channel.send(
            `Cannot remove the song that is currently playing`
          )
          if (queue.curr_pos === 0) {
            message.channel.send(`If there's only one song, use !clear`)
          }
          continue
        }

        message.channel.send(`Removed ${queue.track[to_be_removed].name}`)
        queue.track.splice(to_be_removed, 1)
        if (to_be_removed < queue.curr_pos) {
          queue.curr_pos--
        }
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (remove): ${err}`)
    }
  },
}
