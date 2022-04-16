const { SlashCommandBuilder } = require("@discordjs/builders")
const { populate_info } = require("../helper")
const { documentation } = require("../documentation")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("帮助")
    .addStringOption((option) =>
      option
        .setName("指令")
        .setDescription("获取具体某一条指令的信息")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      let command_param = interaction.options.getString("指令")
      if (!!command_param) command_param = command_param.split(" ")[0]

      let invitation = await interaction.client.guilds.cache
        .get("898299988935843930") // ozy support
        .channels.cache.get("898299988935843933") // welcome channel
        .createInvite()

      await interaction.reply(
        "```" +
          `${documentation(command_param)}` +
          "```\n" +
          (!command_param ? `Support Server: ${invitation}` : "")
      )
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
