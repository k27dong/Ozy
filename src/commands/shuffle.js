const { assert_queue } = require("../helper")

module.exports = {
  info: {
    name: "shuffle",
  },

  run: async (client, message, args) => {
    try {
      message.channel.send(`shuffle is not supported yet :(`)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (shuffle): ${err}`)
    }
  },
}
