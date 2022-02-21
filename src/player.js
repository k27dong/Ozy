const {
  assert_channel_play_queue,
  populate_info,
  send_msg_to_text_channel,
} = require("./helper")
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require("@discordjs/voice")

const play = async (interaction) => {
  let queue = assert_channel_play_queue(interaction)
  let info = populate_info(interaction)

  if (queue.track.length == 0) {
    send_msg_to_text_channel(interaction, `Nothing to play!`)
  }

  let player = undefined

  if (!player) {
    player = createAudioPlayer()
    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!")
    })

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("Song finished")
    })
  }

  if (!queue.connection) {
    queue.connection = joinVoiceChannel({
      channelId: info.voice_channel_id,
      guildId: info.server_id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    })

    queue.connection.subscribe(player)
  }

  // let resource = createAudioResource("/root/test.mp3")
  let resource = createAudioResource("https://download.samplelib.com/mp3/sample-3s.mp3")
  // const resource = createAudioResource("https://streams.ilovemusic.de/iloveradio8.mp3")

  player.play(resource)
}

exports.play = play
