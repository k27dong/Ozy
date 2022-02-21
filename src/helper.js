/**
 * Reads the interaction object from discord and parse it into
 * lightweight object
 *
 * @param {Object} interaction
 * @returns Info object with useful data structures
 */
const populate_info = (interaction) => {
  let info = {
    server_id: interaction.guildId,
    user_id: interaction.member.user.id,
    text_channel_id: interaction.channelId,
    voice_channel_id: interaction.guild.members.cache.get(interaction.member.user.id).voice.channelId
  }

  return info;
}

/**
 * Checks the query result, if the return code is not 200 throws error
 * @param {Query} res
 */
const assert_query_res = (res) => {
  if (res.status != 200) throw `code ${res.status}`
}

const create_queue = (interaction) => {
  let queue = {
    text_channel: interaction.channelId,
    voice_channel: interaction.member.voice.channel,
    track: [],
    volume: 80,
    playing: false,
    looping: false,
    connection: null,
    user: null,
    position: -1
  }

  interaction.client.queue.set(interaction.guildId, queue);
}

const assert_channel_play_queue = (interaction) => {
  if (!interaction.client.queue.get(interaction.guildId)) {
    create_queue(interaction)
  }

  return interaction.client.queue.get(interaction.guildId)
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

const send_msg_to_text_channel = (interaction, content) => {
  interaction.client.channels.cache.get(interaction.channelId).send(content)
}

exports.populate_info = populate_info
exports.assert_query_res =assert_query_res
exports.assert_channel_play_queue = assert_channel_play_queue
exports.display_track = display_track
exports.send_msg_to_text_channel = send_msg_to_text_channel