const { post_command_usage_update } = require("../helper")

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return

    const command = await interaction.client.commands.get(
      interaction.commandName
    )

    if (!command) return

    try {
      post_command_usage_update(command.data.name)
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      })
    }
  },
}
