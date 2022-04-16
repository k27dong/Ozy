const { SlashCommandBuilder } = require("@discordjs/builders")
const { get_user_playlist } = require("../api/netease/get_user_playlist")
const {
  get_songs_from_playlist,
} = require("../api/netease/get_songs_from_playlist")
const {
  assert_channel_play_queue,
  send_msg_to_text_channel,
} = require("../helper")
const { play } = require("../player")
const {
  MessageActionRow,
  MessageSelectMenu,
  MessageEmbed,
} = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("显示用户歌单"),
  async execute(interaction) {
    const filter = (i) => {
      i.deferUpdate()
      return i.user.id === interaction.user.id
    }

    try {
      let queue = assert_channel_play_queue(interaction)

      if (!queue.user) await interaction.reply(`No user set!`)
      else {
        let playlist = await get_user_playlist(queue.user.userId)

        playlist_items = []

        playlist.forEach((pl, i) => {
          playlist_items.push({
            label: pl.name,
            description: `${pl.count}首歌曲 | ${pl.play_count}播放`,
            value: `${i}`,
          })
        })

        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("playlist_select")
            .setPlaceholder("Nothing selected")
            .addOptions(playlist_items)
        )

        await interaction.reply({ content: "选择歌单", components: [row] })
        const message = await interaction.fetchReply()

        message
          .awaitMessageComponent({
            filter,
            componentType: "SELECT_MENU",
            time: 20000, // 20 sec
          })
          .then(async (res) => {
            const selected_playlist = playlist[res.values[0]]

            let playlist_msg = new MessageEmbed()
              .setTitle(`${selected_playlist.name}`)
              // .setDescription(selected_playlist.name)
              .setThumbnail(selected_playlist.cover_img)
              .setFooter({
                text: `${selected_playlist.count} songs`,
              })

            interaction.editReply({
              content: `选择: **${selected_playlist.name}**`,
              components: [],
              embeds: [playlist_msg],
            })

            let playlist_songs = await get_songs_from_playlist(
              selected_playlist
            )

            for (let song of playlist_songs) {
              queue.track.push(song)
            }

            send_msg_to_text_channel(
              interaction,
              `Queued ${playlist_songs.length} songs from ${selected_playlist.name}`
            )

            if (!queue.playing) {
              queue.playing = true
              queue.position = queue.track.length - playlist_songs.length
              play(interaction)
            }
          })
          .catch((err) => {
            console.log(err)
            interaction.editReply({
              content: `err! ${err}`,
              components: [],
            })
          })
      }
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
