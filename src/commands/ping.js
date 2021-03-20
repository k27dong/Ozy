module.exports = {
  info: {
    name: "ping",
    description: "ping pong",
  },

  run: (client, message, args) => {
    try {
      message.channel.send("pong!")
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (ping): ${err}`)
    }
  },
}
