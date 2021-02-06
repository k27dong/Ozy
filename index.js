const Discord = require("discord.js")
const config = require("./config.json")
const API = require("NeteaseCloudMusicApi")
const HELP = require("./helper")
const UTIL = require("./util")

const client = new Discord.Client()
client.login(config.BOT_TOKEN)
const prefix = "!"

/**
 * @var {string} user NetEase user'id
 * @var {string} username NetEase user's username
 * @var {array of obj} playlist All playlist of a user
 * @var {array of obj} curr_track Currently set track
 * @var {} dispatcher
 * @var {int} play_num number of songs left to play
 */
let user,
  username,
  playlist,
  curr_playlist,
  curr_track,
  to_be_played,
  dispatcher,
  play_num = 0,
  song_obj

let login_status = API.login_cellphone({
  phone: config.PHONENUM,
  countrycode: config.COUNTRYCODE,
  password: config.PASSWORD
})

const get_song_url = async (track) => {
  let random_index = Math.floor(Math.random() * track.length)
  let curr_song = await API.song_url({
    id: track[random_index].info.id,
  })

  let url = curr_song.body.data[0].url

  console.log(url)

  return url === null
    ? get_song_url(track)
    : {
        url: url,
        index: random_index,
        id: track[random_index].info.id
      }
}

client.on("message", async (message) => {
  try {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    const commandBody = message.content.slice(prefix.length)
    const args = commandBody.split(" ")
    const command = args.shift().toLowerCase()

    if (command === "ping") {
      message.reply(`Pong!`)
    } else if (command === "set_user") {
      user = args[0]

      let user_detail = await API.user_detail({
        uid: user,
      })

      username = user_detail.body.profile.nickname
      message.reply(`User set to: ${username}\n`)
      client.user.setActivity(username)

      // get playlist
      let playlist_detail = await API.user_playlist({
        uid: user,
      })

      playlist = playlist_detail.body.playlist

      for (let i = 0; i < playlist.length; i++) {
        playlist[i] = {
          name: playlist[i].name,
          id: playlist[i].id,
          playCount: playlist[i].playCount,
        }
      }
    } else if (command === "help") {
      message.channel.send(
        "Senator you can have my answer now if you like. My offer is this:"
      )
      message.channel.send(
        HELP.help_array[Math.floor(Math.random() * HELP.help_array.length)]
      )
    } else if (command === "current_user") {
      if (typeof user !== "undefined") {
        message.channel.send(`Current user: ${username}`)
      } else {
        throw "User not set"
      }
    } else if (command == "show_playlist") {
      if (user != undefined) {
        playlist_info = "```"
        for (let i = 0; i < playlist.length; i++) {
          playlist_info += `${i}: ${playlist[i].name} (播放量: ${playlist[i].playCount})\n`
        }
        playlist_info += "```"
        message.channel.send(playlist_info)
      } else {
        throw "User not set"
      }
    } else if (command === "helpme") {
      message.channel.send(HELP.general_msg())
    } else if (command === "set_playlist") {
      if (typeof playlist === "undefined") {
        throw "User not set"
      } else if (args.length !== 1) {
        throw "Invalid arguments"
      } else {
        const selected_index = args[0]
        let playlist_data = []

        curr_playlist = await API.playlist_detail({
          id: playlist[selected_index].id,
        })

        message.channel.send(
          `Current track set to ${playlist[selected_index].name}`
        )

        curr_track = curr_playlist.body.playlist.tracks
        for (let i = 0; i < curr_track.length; i++) {
          curr_track[i] = {
            info: {
              name: curr_track[i].name,
              id: curr_track[i].id,
            },
            artist: {
              name: curr_track[i].ar[0].name,
              id: curr_track[i].ar[0].id,
            },
            album: {
              name: curr_track[i].al.name,
              id: curr_track[i].al.id,
            },
          }
        }

        for (
          let i = 0;
          i < (curr_track.length >= 20 ? 20 : curr_track.length);
          i++
        ) {
          playlist_data.push([
            curr_track[i].info.name,
            curr_track[i].artist.name,
            curr_track[i].album.name,
          ])
        }

        let info = "```\n"
        for (let i = 0; i < playlist_data.length; i++) {
          info += `${i + 1}) ${playlist_data[i][0]} (${playlist_data[i][1]})\n`
        }
        info += "```"

        message.channel.send(info)
      }
    } else if (command === "play") {
      if (typeof curr_track === "undefined") {
        throw "Track not set"
      } else {
        if (args.length === 1 && typeof args[0] === "number") {
          play_num = args[0]
        }

        if (message.member.voice.channel) {
          const connection = await message.member.voice.channel.join()

          song_obj = await get_song_url(curr_track)

          dispatcher = connection.play(song_obj.url)

          dispatcher.on("start", () => {
            message.channel.send(
              `Playing: ${curr_track[song_obj.index].info.name} (${
                curr_track[song_obj.index].artist.name
              })`
            )
          })

          dispatcher.on("finish", async () => {
            if (typeof play_num === "undefined" || play_num > 0) {
              // keep playing next song
              if (typeof play_num !== "undefined") {
                play_num--
              }

              song_obj = get_song_url(curr_track)
              dispatcher = connection.play(song_obj.url)
            } else {
              message.member.voice.channel.leave()
            }
          })

          dispatcher.on("error", () => {
            console.error()
            message.member.voice.channel.leave()
          })
        }
      }
    } else if (command === "lyric" || command === "lyrics") {
      if (typeof song_obj === 'undefined') {
        throw "Nothing's playing"
      }
      else {
        let curr_lyric = await API.lyric({
          id: song_obj.id
        })

        if (curr_lyric.status == 200) {
          message.channel.send(UTIL.parse_lrc(curr_lyric.body.lrc.lyric))
        }
      }
    } else if (command === "stop") {
      if (typeof dispatcher !== "undefined") {
        dispatcher.destroy()
        message.member.voice.channel.leave()
      }
    } else if (command === "pause") {
      if (typeof dispatcher !== "undefined") {
        dispatcher.pause(true)
      }
    } else if (command === "resume") {
      if (typeof dispatcher !== "undefined") {
        dispatcher.resume()
      }
    } else {
      // unidentified command
      message.channel.send(`Command not found: ${command}`)
    }
  } catch (err) {
    console.log(err)
    message.channel.send(`Error: ${err}`)
  }
})
