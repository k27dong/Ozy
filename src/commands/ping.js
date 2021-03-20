module.exports = {
  info: {
    name: "ping",
    description: "ping pong",
  },

  run: (client, message, args) => {
    message.channel.send("pong!").catch(console.error)
  },
}
