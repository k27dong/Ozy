exports.run = (client, message, args) => {
  if (!args || args.length < 1) {
    // TODO: reload all
    return message.reply("Must provide a command name to reload.")
  }
  else {
    const command_name = args[0]

    if (!client.commands.has(command_name)) {
      return message.reply(`${command_name} is not a valid command`)
    }

    delete require.cache[require.resolve(`./${command_name}.js`)]

    client.commands.delete(command_name)
    const props = require(`./${command_name}.js`)
    client.commands.set(command_name, props)

    message.reply(`${command_name} has been reloaded`)
  }
}
