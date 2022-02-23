const { MessageActionRow, MessageSelectMenu } = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { search_album } = require("../api/netease/search_album")
const {
  populate_info,
  assert_channel_play_queue,
  send_msg_to_text_channel,
} = require("../helper")
const { get_album_songs } = require("../api/netease/get_album_songs")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("album")
    .setDescription("专辑搜索")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("专辑名").setRequired(true)
    ),
  async execute(interaction) {
    let tunnel = "netease" // for now only netease is supported

    const filter = (i) => {
      i.deferUpdate()
      return i.user.id === interaction.user.id
    }

    try {
      const info = populate_info(interaction)

      if (!info.voice_channel_id) throw "you must be in a voice channel!"

      let queue = assert_channel_play_queue(interaction)
      const song_search_keywords = interaction.options.getString("搜索")
      const query_result = await search_album(song_search_keywords)

      if (query_result.length == 0) throw "can't find any result"

      let album_items = []

      query_result.forEach((al, i) => {
        album_items.push({
          label: al.name,
          description: `${al.ar} | ${al.size}首 | ${new Date(
            al.date
          ).getFullYear()}`,
          value: `${i}`,
        })
      })

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("select")
          .setPlaceholder("Nothing selected")
          .addOptions(album_items)
      )

      await interaction.reply({ content: "搜索结果", components: [row] })
      const message = await interaction.fetchReply()

      message
        .awaitMessageComponent({
          filter,
          componentType: "SELECT_MENU",
          time: 60000,
        })
        .then(async (res) => {
          const album = query_result[res.values[0]]
          interaction.editReply({
            content: `选择: **${album.name}**`,
            components: [],
          })
          let album_songs = await get_album_songs(album)

          for (let song of album_songs) {
            queue.track.push(song)
          }

          send_msg_to_text_channel(
            interaction,
            `Queued ${album_songs.length} songs from ${album.name}`
          )

          if (!queue.playing) {
            queue.playing = true
            queue.position = queue.track.length - album_songs.length
            play(interaction)
          }
        })
        .catch((err) => {
          console.log(`No interactions were collected.`)
          console.log(err)
        })
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
