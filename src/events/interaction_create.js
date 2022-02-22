module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return

    const command = await interaction.client.commands.get(
      interaction.commandName
    )

    // console.log(command);

    if (!command) return

    try {
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
