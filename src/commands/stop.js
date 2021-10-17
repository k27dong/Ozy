const { assert_queue } = require("../helper")

module.exports = {
  info: {
    name: "stop",
  },

  run: (client, message, args) => {
    try {
      let queue = assert_queue(message)

      if (!queue.connection) return

      if (!!queue.connection.dispatcher) {
        queue.connection.dispatcher.end()
      }

      queue.connection.dispatcher.end()
      message.guild.me.voice.channel.leave()
      message.client.queue.delete(message.guild.id)
      message.react("✅")
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (stop): ${err}`)
    }
  },
}
