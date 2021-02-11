const {
  login_cellphone,
  cloudsearch,
  song_url,
  lyric,
  user_detail,
  user_playlist,
} = require("NeteaseCloudMusicApi")

const assert_status_code = (res) => {
  if (res.status != 200) {
    throw `code ${res.status}`
  }
}

const login = async (phonenum, countrycode, password) => {
  let login_q = await login_cellphone({
    phone: phonenum,
    countrycode: countrycode,
    password: password,
  })

  if (login_q.body.code == 200) {
    console.log(`Successfully logged in!`)
    console.log(`Bot User: ${login_q.body.profile.nickname}`)
  } else {
    console.log(`Default login error: code ${login_q.body.code}`)
  }
}

const search_and_add = async (track, keywords, channel) => {
  let search_q = await cloudsearch({
    keywords: keywords,
  })

  assert_status_code(search_q)

  if (search_q.body.result.songCount === 0) {
    return track
  }

  let raw_song = search_q.body.result.songs[0]

  let new_song = {
    name: raw_song.name,
    id: raw_song.id,
    ar: {
      name: raw_song.ar[0].name,
      id: raw_song.ar[0].id,
    },
    al: {
      name: raw_song.al.name,
      id: raw_song.al.id,
    },
  }

  channel.send(`**Queued**: ${new_song.name} (${new_song.ar.name})`)

  track.push(new_song)
  return track
}

const get_song_url_by_id = async (id) => {
  let song_q = await song_url({
    id: id,
  })

  assert_status_code(song_q)

  let url = song_q.body.data[0].url

  return url
}

const get_raw_lyric_by_id = async (id) => {
  let lyric_q = await lyric({
    id: id,
  })

  assert_status_code(lyric_q)

  return lyric_q.body.lrc.lyric
}

const set_user_by_id = async (id, channel) => {
  let user_q = await user_detail({
    uid: id,
  })

  let playlist_q = await user_playlist({
    uid: id,
  })

  assert_status_code(user_q)
  assert_status_code(playlist_q)

  playlist = []

  for (let p of playlist_q.body.playlist) {
    playlist.push({
      id: p.id,
      name: p.name,
      playCount: p.playCount,
      trackCount: p.trackCount,
    })
  }

  channel.send(`Selected user: ${user_q.body.profile.nickname}`)

  return {
    username: user_q.body.profile.nickname,
    playlist: playlist,
  }
}

exports.login = login
exports.search_and_add = search_and_add
exports.get_song_url_by_id = get_song_url_by_id
exports.get_raw_lyric_by_id = get_raw_lyric_by_id
exports.set_user_by_id = set_user_by_id
