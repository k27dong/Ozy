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
    case "playsong":
      return "play"
    case "q":
      return "queue"
    case "lyric":
      return "lyric"
    case "pa":
    case "playalbum":
      return "album"
    case "h":
      return "help"
    case "f":
    case "pf":
      return "playfile"
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

const parse_duration = (raw_duration) => {
  let time = Number(raw_duration)
  let parsed = ""

  if (isNaN(time) || time < 0) {
    return "00:00"
  }

  // 289.69795918367345 -> 04:50
  let mins = ~~(time / 60)
  let secs = ~~(time % 60)

  parsed +=
    "" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs
  return parsed
}

const remove_element_from_array = (arr, e) => {
  let sanitized_arr = []
  let flag = false

  for (let i = 0; i < arr.length; i++) {
    if (_.isEqual(arr[i], e) && !flag) {
      flag = true
      continue
    }

    sanitized_arr.push(arr[i])
  }

  return sanitized_arr
}

exports.create_queue = create_queue
exports.assert_queue = assert_queue
exports.validate_args = validate_args
exports.display_track = display_track
exports.formulate_command = formulate_command
exports.parse_lrc = parse_lrc
exports.parse_album_list = parse_album_list
exports.filter = filter
exports.parse_duration = parse_duration
exports.remove_element_from_array = remove_element_from_array
