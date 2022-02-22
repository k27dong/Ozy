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
} = require("@discordjs/voice")
const { get_song_url_by_id } = require("./api/netease/get_song_url_by_id")

const play = async (interaction) => {
  let queue = assert_channel_play_queue(interaction)
  let info = populate_info(interaction)

  if (queue.track.length == 0) {
    send_msg_to_text_channel(interaction, `Nothing to play!`)
  }

  if (!queue.player) {
    queue.player = createAudioPlayer()
    queue.player.on(AudioPlayerStatus.Playing, () => {
      console.log("Playing starts")
    })

    queue.player.on(AudioPlayerStatus.Idle, async () => {
      if (!queue.looping && queue.position >= queue.track.length - 1) {
        queue.playing = false
        send_msg_to_text_channel(interaction, `End of queue.`)
        queue.position = -1
        queue.player.stop()
      } else {
        queue.position = queue.looping
          ? (queue.position + 1) % queue.track.length
          : queue.position + 1

        let resource = await next_resource(interaction)
        queue.player.play(resource)
      }
    })
  }

  if (!queue.connection) {
    queue.connection = joinVoiceChannel({
      channelId: info.voice_channel_id,
      guildId: info.server_id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    })

    queue.connection.subscribe(queue.player)
  }

  let resource = await next_resource(interaction)
  queue.player.play(resource)
}

const next_resource = async (interaction) => {
  let queue = assert_channel_play_queue(interaction)
  let cookie = interaction.client.cookie

  if (queue.track.length == 0) {
    send_msg_to_text_channel(interaction, `Nothing to play!`)
    queue.player.stop()
  }

  let url
  let play_message = ""
  let curr_song = queue.track[queue.position]

  if (curr_song.source === "netease") {
    url = await get_song_url_by_id(curr_song.id, cookie)
    play_message = `Playing: ${queue.track[queue.position].name} (${
      queue.track[queue.position].ar.name
    })`
  } else {
    send_msg_to_text_channel(
      interaction,
      `Sources from ${curr_song.source} is not supported yet!`
    )
  }

  if (!!url) {
    send_msg_to_text_channel(interaction, play_message)
    console.log(url)

    // url = "https://download.samplelib.com/mp3/sample-3s.mp3"
    return createAudioResource(url)
  } else {
    console.log("url invalid")

    if (curr_song.source === "netease") {
      send_msg_to_text_channel(interaction, `Invalid song: ${curr_song.name}`)
    } else {
      send_msg_to_text_channel(interaction, "Invalid song")
    }

    if (!queue.looping && queue.position >= queue.track.length - 1) {
      queue.playing = false
      send_msg_to_text_channel(interaction, `End of queue.`)
      queue.position = -1
      return
    } else {
      queue.position = queue.looping
        ? (queue.position + 1) % queue.track.length
        : queue.position + 1
      return next_resource(interaction)
    }
  }
}

exports.play = play
