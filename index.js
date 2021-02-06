const Discord = require("discord.js")
const config = require("./config.json")
const API = require("NeteaseCloudMusicApi")
const HELP = require("./helper")

const client = new Discord.Client()
client.login(config.BOT_TOKEN)
const prefix = "!"

let user, username, playlist, curr_playlist, curr_track

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
      // display playlist
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
    } else if (command === "playlist_info") {
      if (args.length == 1) {
        const selected_index = args[0]
        let playlist_data = []

        curr_playlist = await API.playlist_detail({
          id: playlist[selected_index].id,
        })

        curr_track = curr_playlist.body.playlist.tracks

        for (let i = 0; i < curr_track.length; i++) {
          curr_track[i] = {
            author: {
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
            curr_track[i].author.name,
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
      } else {
        throw "Invalid arg"
      }
    } else if (command === "helpme") {
      message.channel.send(HELP.general_msg())
    } else if (command === "play") {
      if (args.length == 1) {
        // TODO
      } else {
        throw "Invalid arg"
      }
    }
  } catch (err) {
    console.log(err)
    message.channel.send(`Error: ${err}`)
  }
})
