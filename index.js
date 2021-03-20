const Discord = require("discord.js")
const fs = require("fs")
const { login } = require("./src/api")
const { EVENTS_DIR, COMMANDS_DIR } = require("./src/const")
const CONFIG = require("./config.json")

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.config = CONFIG
client.queue = new Map()

login(CONFIG.PHONENUM, CONFIG.COUNTRYCODE, CONFIG.PASSWORD)

fs.readdir(`./src/${EVENTS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    const event = require(`./src/${EVENTS_DIR}/${file}`)
    let eventName = file.split(".")[0]
    client.on(eventName, event.bind(null, client))
  })
})

fs.readdir(`./src/${COMMANDS_DIR}/`, (err, files) => {
  if (err) return console.error(err)

  files.forEach((file) => {
    if (!file.endsWith(".js")) return

    let props = require(`./src/${COMMANDS_DIR}/${file}`)
    let command_name = file.split(".")[0]
    process.stdout.write(`Loading: ${command_name}`)
    client.commands.set(command_name, props)
    console.log(`\t\t ... done`)
  })
})

client.login(CONFIG.BOT_TOKEN)

// case "remove":
//   if (args.length !== 1) {
//     throw "Invalid args"
//   }
//   let remove_pos = Number(args[0])

//   if (
//     !Number.isInteger(remove_pos) ||
//     remove_pos <= 0 ||
//     remove_pos > track.length
//   ) {
//     throw `${remove_pos} is not a valid index`
//   }

//   let real_remove_pos = remove_pos - 1

//   if (real_remove_pos === pos) {
//     let throw_msg = "cannot remove song that is currently playing"
//     if (pos === 0) {
//       throw_msg += ", if there's only one song, use !clear"
//     }
//     throw throw_msg
//   }

//   message.channel.send(`Removed ${track[real_remove_pos].name}`)

//   track.splice(real_remove_pos, 1)

//   if (real_remove_pos < pos) {
//     pos--
//   }

//   break
// case "shuffle":
//   let temp_curr = undefined

//   if (UTIL.exist(dispatcher)) {
//     temp_curr = track[pos]
//   }

//   track = UTIL.shuffle(track)
//   pos = 0

//   if (UTIL.exist(temp_curr)) {
//     track = UTIL.remove_element_from_array(track, temp_curr)
//     track.unshift(temp_curr)
//   }

//   message.react("✅")
//   break
// case "user":
//   if (args.length !== 1) {
//     throw "Invalid args"
//   }
//   let input_id = Number(args[0])

//   if (Number.isInteger(input_id)) {
//     user = API.set_user_by_id(input_id, channel)
//   } else {
//     throw "Invalid arg"
//   }
//   break
// case "list":
//   break
