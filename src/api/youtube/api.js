const ytdl = require("ytdl-core")

const get_audio_from_raw_url = async (url) => {
  let raw_song = await ytdl.getBasicInfo(url)
  let u2b_url = ytdl(url, {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
    type: "opus",
  })

  let song = {
    name: raw_song.player_response.videoDetails.title,
    id: raw_song.player_response.videoDetails.videoId,
    ar: {
      name: null,
      id: null,
    },
    al: {
      name: null,
      id: null,
    },
    url: u2b_url,
    source: "youtube_url",
  }

  return song
}

exports.get_audio_from_raw_url = get_audio_from_raw_url
