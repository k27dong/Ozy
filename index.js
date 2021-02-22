const Discord = require("discord.js")
const CONFIG = require("./config.json")
const VAL = require("./src/const")
const API = require("./src/api")
const MSG = require("./src/message")
const UTIL = require("./src/util")

let track = []
let pos = 0
let connection, dispatcher
let g_message
let pass_flag = false
let user

const client = new Discord.Client()

console.log(`Logging in ...`)

client.login(CONFIG.BOT_TOKEN)
API.login(CONFIG.PHONENUM, CONFIG.COUNTRYCODE, CONFIG.PASSWORD)

client.on("message", async (message) => {
  try {
    g_message = message
    if (message.author.bot) return
    if (!message.content.startsWith(VAL.PREFIX)) return

    const channel = message.channel
    const command_body = message.content.slice(VAL.PREFIX.length)
    const args = command_body.split(" ")
    const command = args.shift().toLowerCase()

    switch (command) {
      case "ping":
        message.reply("Pong!")
        break
      case "p":
      case "play":
      case "playsong":
        if (args.length === 0) {
          throw "Invalid args"
        }

        let keywords = ""
        for (let word of args) {
          keywords += `${word} `
        }

        track = await API.search_and_add(track, keywords, channel)
        break
      case "q":
      case "queue":
        // add current pos
        // go back at most 5, go front at most 4
        // tries to back to 10, tries to future to 10

        let remain = 10
        let displayed_tracks = []

        if (track.length !== 0) {
          displayed_tracks.push({
            song: track[pos],
            pos: pos,
            curr: true,
          })
          remain--

          let go_back = pos > 5 ? 5 : pos
          for (let i = 1; i <= go_back; i++, remain--) {
            displayed_tracks.unshift({
              song: track[pos - i],
              pos: pos - i,
              curr: false,
            })
          }

          let go_front = track.length - pos - 1 > 4 ? 4 : track.length - pos - 1
          for (let i = 1; i <= go_front; i++, remain--) {
            displayed_tracks.push({
              song: track[pos + i],
              pos: pos + i,
              curr: false,
            })
          }

          for (; remain > 0 && go_back + 1 <= pos; remain--, go_back++) {
            displayed_tracks.unshift({
              song: track[pos - go_back - 1],
              pos: pos - go_back - 1,
              curr: false,
            })
          }

          for (
            ;
            remain > 0 && go_front + pos + 1 < track.length;
            remain--, go_front++
          ) {
            displayed_tracks.push({
              song: track[pos + go_front + 1],
              pos: pos + go_front + 1,
              curr: false,
            })
          }
        }

        message.channel.send(MSG.display_track(displayed_tracks))
        break
      case "start":
        if (!UTIL.exist(dispatcher)) {
          pass_flag = false
          play()
        }
        break
      case "next":
        if (!UTIL.exist(dispatcher) || !UTIL.exist(connection)) {
          throw "Nothing's playing"
        }
        dispatcher.destroy()
        pos = (pos + 1) % track.length
        pass_flag = false
        play()
        break
      case "prev":
        if (!UTIL.exist(dispatcher) || !UTIL.exist(connection)) {
          throw "Nothing's playing"
        }
        dispatcher.destroy()
        pos = pos - 1 < 0 ? 0 : pos - 1
        pass_flag = false
        play()
        break
      case "remove":
        if (args.length !== 1) {
          throw "Invalid args"
        }
        let remove_pos = Number(args[0])

        if (
          !Number.isInteger(remove_pos) ||
          remove_pos <= 0 ||
          remove_pos > track.length
        ) {
          throw `${remove_pos} is not a valid index`
        }

        let real_remove_pos = remove_pos - 1

        if (real_remove_pos === pos) {
          let throw_msg = "cannot remove song that is currently playing"
          if (pos === 0) {
            throw_msg += ", if there's only one song, use !clear"
          }
          throw throw_msg
        }

        message.channel.send(`Removed ${track[real_remove_pos].name}`)

        track.splice(real_remove_pos, 1)

        if (real_remove_pos < pos) {
          pos--
        }

        break
      case "lyric":
      case "lyrics":
        if (!UTIL.exist(track[pos])) {
          throw "Nothing's playing"
        }
        let raw_lrc = await API.get_raw_lyric_by_id(track[pos].id)
        message.channel.send(UTIL.parse_lrc(raw_lrc))
        break
      case "stop":
        if (UTIL.exist(dispatcher)) {
          dispatcher.destroy()
          message.member.voice.channel.leave()
        }
        break
      case "pause":
        if (UTIL.exist(dispatcher)) {
          dispatcher.pause(true)
        }
        break
      case "resume":
        if (UTIL.exist(dispatcher)) {
          dispatcher.resume()
        }
        break
      case "whoami":
        message.channel.send(MSG.ozy_poem)
        break
      case "clear":
        if (UTIL.exist(dispatcher)) {
          dispatcher.destroy()
          message.member.voice.channel.leave()
        }
        track = []
        pos = 0
        message.channel.send("```Track cleared!```")
        break
      case "shuffle":
        let temp_curr = undefined

        if (UTIL.exist(dispatcher)) {
          temp_curr = track[pos]
        }

        track = UTIL.shuffle(track)
        pos = 0

        if (UTIL.exist(temp_curr)) {
          track = UTIL.remove_element_from_array(track, temp_curr)
          track.unshift(temp_curr)
        }

        message.react("✅")
        break
      case "user":
        if (args.length !== 1) {
          throw "Invalid args"
        }
        let input_id = Number(args[0])

        if (Number.isInteger(input_id)) {
          user = API.set_user_by_id(input_id, channel)
        } else {
          throw "Invalid arg"
        }
        break
      case "list":
        break
      case "pa":
      case "album":
      case "playalbum":
        if (args.length === 0) {
          throw "Invalid args"
        }

        let album_keywords = ""
        for (let word of args) {
          album_keywords += `${word} `
        }

        let search_results = await API.search_album(album_keywords)

        message.channel
          .send(UTIL.parse_album_list(search_results))
          .then(async (message) => {
            for (let i = 0; i < search_results.length; i++) {
              await message.react(VAL.NUM_EMOJI[i + 1])
            }

            message
              .awaitReactions(UTIL.filter, {
                max: 1,
                time: 60000,
                errors: ["time"],
              })
              .then(async (collected) => {
                const reaction = collected.first()

                track = await API.add_album(
                  search_results[
                    VAL.NUM_EMOJI.indexOf(reaction.emoji.name) - 1
                  ],
                  track,
                  message.channel
                )
              })
              .catch(() => {
                message.reply("invalid reaction")
              })
          })
        break
      case "h":
      case "help":
        message.channel.send(MSG.help_1())
        break
      default:
        message.channel.send(`Command not found: ${command}`)
    }
  } catch (err) {
    console.log(err)
    message.channel.send(`Error: ${err}`)
  }
})

const play = async () => {
  connection = await g_message.member.voice.channel.join()

  let url

  if (pass_flag) {
    pos = (pos + 1) % track.length
  }
  pass_flag = true

  url = await API.get_song_url_by_id(track[pos].id)

  while (typeof url === "undefined") {
    pos = (pos + 1) % track.length
    url = await API.get_song_url_by_id(track[pos].id)
  }

  console.log(url)

  g_message.channel.send(`Playing: ${track[pos].name} (${track[pos].ar.name})`)

  dispatcher = connection.play(url).on("finish", play)
}
