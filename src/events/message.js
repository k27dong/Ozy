const { formulate_command, get_general_help_message } = require("../helper")

module.exports = (client, message) => {
  if (message.author.bot) return

  if (
    message.mentions.has(client.user.id) &&
    !message.content.includes("@here") &&
    !message.content.includes("@everyone") &&
    message.content.startsWith("<@!")
  ) {
    message.channel.send(get_general_help_message())
  }

  if (message.content.indexOf(client.config.PREFIX) !== 0) return

  const args = message.content
    .slice(client.config.PREFIX.length)
    .trim()
    .split(/ +/g)

  const command = formulate_command(args.shift().toLowerCase())

  const cmd = client.commands.get(command)

  if (!cmd) return

  cmd.run(client, message, args)
}
