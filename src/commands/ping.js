const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("you're supposed to get pong"),
  async execute(interaction) {
    try {
      await interaction.reply("Pong!")
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
