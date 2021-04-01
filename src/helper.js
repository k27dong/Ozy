const { MessageEmbed } = require("discord.js")
const { NUM_EMOJI, REGEX_CHINESE } = require("./const")
const { GENERAL_HELP_MESSAGE } = require("./help_msg")
const psl = require("psl")

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
      ;(this.curr_pos = -1), (this.user = null)
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
  let maxed = false
  let i = 0

  for (; i < track.length; i++) {
    let item = track[i].song
    let new_line = `${track[i].pos + 1}) ${item.name} ${
      !!item.ar.name ? `(${item.ar.name})` : ""
    }${track[i].curr ? `   ◄———— \n` : `\n`}`

    if (queue.length + new_line.length >= 1990) {
      maxed = true
      break
    }

    queue += new_line
  }

  if (maxed) {
    queue += `${track[i].pos + 1}) ...`
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
    case "j":
    case "goto":
      return "jump"
    case "n":
    case "skip":
      return "next"
    case "b":
    case "back":
      return "prev"
    case "list":
      return "playlist"
    case "rm":
      return "remove"
    case "leave":
    case "reset":
      return "stop"
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

const get_user_embed_msg = (user) => {
  let user_msg = new MessageEmbed()
    .setTitle(`User: ${user.nickname}`)
    .setDescription(user.signature)
    .setThumbnail(user.avatarUrl)
    .setFooter(`${user.playlistCount} playlists`)

  return user_msg
}

const parse_playlist_list = (list) => {
  const fill_space = (i, name) => {
    let spaces = ""

    if (i >= 0) {
      for (let j = 0; j < 3 - ~~Math.log10(i); j++) {
        spaces += " "
      }
    } else {
      let base = 28
      let cn_count = 0
      for (let j = 0; j < name.length; j++) {
        if (!!REGEX_CHINESE.test(name[j])) {
          cn_count++
        }
      }

      base -= Math.round((cn_count * 5) / 3)
      base -= name.length - cn_count

      base = Math.max(base, 3)
      for (let j = 0; j < base; j++) {
        spaces += " "
      }
    }

    return spaces
  }

  const trunc_name = (name) => {
    let sanitized_name = ""

    for (
      let i = 0, actual_length = 0;
      i < name.length && ~~actual_length <= 30;
      i++
    ) {
      actual_length += !!REGEX_CHINESE.test(name[i]) ? 1.67 : 1
      sanitized_name += name[i]
    }

    if (sanitized_name !== name) {
      sanitized_name += "..."
    }

    return sanitized_name
  }

  let msg = "```"

  for (let i = 0; i < list.length; i++) {
    msg += `${i + 1})${fill_space(i + 1, "")}`
    msg += `${trunc_name(list[i].name)}`
    msg += `${fill_space(-1, list[i].name)}`
    msg += `(${list[i].count})\n`
  }

  msg += "```"

  return msg
}

const shuffle = (array) => {
  var curr_index = array.length,
    temp_value,
    ran_index

  while (0 !== curr_index) {
    ran_index = Math.floor(Math.random() * curr_index)
    curr_index -= 1

    temp_value = array[curr_index]
    array[curr_index] = array[ran_index]
    array[ran_index] = temp_value
  }

  return array
}

const is_url = (url) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  )

  return !!pattern.test(url)
}

const is_youtube = (url) => {
  let host = psl.get(extract_host(url))

  return host.includes("youtube") || host.includes("youtu.be")
}

const is_bilibili = (url) => {
  let host = psl.get(extract_host(url))

  return host.includes("bilibili")
}

const extract_host = (url) => {
  var hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2]
  } else {
    hostname = url.split("/")[0]
  }

  hostname = hostname.split(":")[0]
  hostname = hostname.split("?")[0]

  return hostname
}

const invalid_number = (num, low, high) => {
  return isNaN(num) || !Number.isInteger(num) || num <= low || num >= high
}

const reply_filter = (m, message) => {
  return m.author.id === message.author.id
}

const get_general_help_message = () => {
  let help_message = new MessageEmbed()
    .setColor("#2C2F33")
    .setDescription(GENERAL_HELP_MESSAGE)

  return help_message
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
exports.get_user_embed_msg = get_user_embed_msg
exports.parse_playlist_list = parse_playlist_list
exports.shuffle = shuffle
exports.is_url = is_url
exports.is_youtube = is_youtube
exports.is_bilibili = is_bilibili
exports.invalid_number = invalid_number
exports.reply_filter = reply_filter
exports.get_general_help_message = get_general_help_message
