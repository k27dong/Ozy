const { assert_queue } = require("./helper")
const { get_song_url_by_id } = require("./api")

const play = async (message) => {
  let queue = assert_queue(message)
  let channel = message.member.voice.channel

  if (queue.track.length === 0) {
    message.channel.send(`Nothing to play!`)
    return
  }

  if (!message.channel) {
    queue.playing = false
    message.channel.send(`You're not in a voice channel!`)
    return
  }

  if (!queue.connection) {
    queue.connection = await channel.join()
  }

  queue.connection.on("disconnect", () => {
    message.client.queue.delete(message.guild.id)
  })

  let curr_song = queue.track[queue.curr_pos]

  let url, dispatcher
  let play_message = ""

  if (curr_song.source === "netease") {
    url = await get_song_url_by_id(curr_song.id)
    play_message = `Playing: ${queue.track[queue.curr_pos].name} (${
      queue.track[queue.curr_pos].ar.name
    })`
    console.log(url)
  }

  if (curr_song.source === "uploaded_audio") {
    url = curr_song.url
    play_message = `Playing: ${queue.track[queue.curr_pos].name} (${
      queue.track[queue.curr_pos].ar.name
    })`
    console.log(url)
  }

  if (!!url) {
    queue.text_channel.send(play_message)
    dispatcher = queue.connection.play(url).on("finish", () => {
      play_next(message)
    })
  } else {
    console.log("url invalid")

    if (curr_song.source === "netease") {
      queue.text_channel.send(`Invalid song: ${curr_song.name}`)
    } else {
      queue.text_channel.send("Invalid song")
    }
    play_next(message)
  }
}

const play_next = async (message) => {
  let queue = assert_queue(message)

  if (queue.track.length === 0) {
    message.channel.send(`Nothing to play!`)
    queue.playing = false
    return
  }

  if (queue.looping) {
    queue.curr_pos = (queue.curr_pos + 1) % queue.track.length
    play(message)
  } else {
    if (queue.curr_pos < queue.track.length - 1) {
      queue.curr_pos++
      play(message)
    } else {
      queue.playing = false
      message.channel.send("End of queue.")
      queue.curr_pos = -1
    }
  }
}

const play_prev = async (message) => {
  let queue = assert_queue(message)

  if (queue.track.length === 0) {
    message.channel.send(`Track empty!`)
    queue.playing = false
    return
  }

  queue.curr_pos = Math.max(queue.curr_pos - 1, 0)
  play(message)
}

exports.play = play
exports.play_next = play_next
exports.play_prev = play_prev
