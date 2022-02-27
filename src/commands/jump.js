const { SlashCommandBuilder } = require("@discordjs/builders")
const { assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("播放指定位置")
    .addIntegerOption((option) =>
      option.setName("位置").setDescription("播放位置").setRequired(true)
    ),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      let new_position = interaction.options.getInteger("位置")
      if (new_position <= 0 || new_position >= queue.track.length + 1) {
        throw `${new_position} is not a valid index to jump to`
      }

      if (queue.position === new_position - 1) {
        await interaction.reply(`${new_position} is playing!`)
      } else {
        queue.position = new_position - 1
        queue.playing = true
        await interaction.reply(
          `jumped to: ${queue.track[queue.position].name}`
        )
        play(interaction)
      }
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
