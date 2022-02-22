const { SlashCommandBuilder } = require("@discordjs/builders")
const { get_raw_lyric_by_id } = require("../api/netease/get_raw_lyric_by_id")
const { assert_channel_play_queue, parse_lrc } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder().setName("lyric").setDescription("显示歌词"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      if (!!queue.player) {
        if (queue.track[queue.position].source === "netease") {
          const raw_lrc = await get_raw_lyric_by_id(
            queue.track[queue.position].id
          )
          await interaction.reply(parse_lrc(raw_lrc))
        } else if (queue.track[queue.position].source === "uploaded_audio") {
          // TODO: find something else (maybe musixmatch)
        }
      }
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
