const { NUM_EMOJI } = require("./const")

const create_queue = (message) => {
  class Queue {
    constructor(message) {
      this.text_channel = message.channel
      this.voice_channel = message.member.voice.channel
      this.track = []
      this.volume = 80
      this.playing = false
      this.looping = false
      this.connection = null
      this.curr_pos = -1
    }
  }

  let queue = new Queue(message)

  message.client.queue.set(message.guild.id, queue)
}

const assert_queue = (message) => {
  if (!message.client.queue.get(message.guild.id)) {
    create_queue(message)
  }

  return message.client.queue.get(message.guild.id)
}

const validate_args = (args) => {
  if (args.length === 0) {
    throw "Invalid args"
  }
}

const display_track = (track) => {
  if (track.length === 0) {
    return "```Track empty!```"
  }

  let queue = "```"
  for (let i = 0; i < track.length; i++) {
    let item = track[i].song
    queue += `${track[i].pos + 1}) ${item.name} (${item.ar.name})`
    queue += track[i].curr ? `   ◄———— \n` : `\n`
  }

  queue += "```"

  return queue
}

const formulate_command = (command) => {
  switch (command) {
    case "p":
    case "play":
    case "playsong":
      return "play"
    case "q":
    case "queue":
      return "queue"
    case "lyric":
    case "lyrics":
      return "lyric"
    case "pa":
    case "album":
    case "playalbum":
      return "album"
    case "h":
    case "help":
      return "help"
    default:
      return command
  }
}

const parse_lrc = (lrc) => {
  if (typeof lrc === "undefined") {
    return "```No lyrics available```"
  }
  let sanitized = lrc.split("\n")
  for (let i = 0; i < sanitized.length; i++) {
    let l = sanitized[i]
    try {
      if (l.length >= 0 && l[0] == "[") {
        sanitized[i] = sanitized[i].slice(sanitized[i].indexOf("]") + 1)
      }
    } catch (err) {
      console.log(err)
    }
  }

  let parsed = "```"
  for (let i = 0; i < sanitized.length; i++) {
    if (parsed.length < 1985) {
      parsed += sanitized[i] + "\n"
    }
  }
  parsed += "```"

  return parsed
}

const parse_album_list = (list) => {
  // `1) 黑梦 (窦唯, 1994) [10 songs]`

  let msg = "```"

  for (let i = 0; i < list.length; i++) {
    let temp_date = new Date(list[i].date)
    msg += `${i + 1})    ${list[i].name} (${
      list[i].ar
    }, ${temp_date.getFullYear()})`
    msg += ` [${list[i].size} song${list[i].size > 1 ? "s" : ""}]\n`
  }

  msg += "```"

  return msg
}

const filter = (reaction, user) => {
  return NUM_EMOJI.includes(reaction.emoji.name)
}

exports.create_queue = create_queue
exports.assert_queue = assert_queue
exports.validate_args = validate_args
exports.display_track = display_track
exports.formulate_command = formulate_command
exports.parse_lrc = parse_lrc
exports.parse_album_list = parse_album_list
exports.filter = filter
