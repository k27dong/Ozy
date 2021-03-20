exports.module = {
  info: {
    name: "help",
  },

  run: async (client, message, args) => {
    try {
      message.channel.send(`help given`)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (help): ${err}`)
    }
  },
}
