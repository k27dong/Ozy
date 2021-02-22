const {
  login_cellphone,
  cloudsearch,
  song_url,
  lyric,
  user_detail,
  user_playlist,
  album,
} = require("NeteaseCloudMusicApi")

/**
 * Check if the api call returns a valid resule
 * @param {Object} res result from an api call
 */
const assert_status_code = (res) => {
  if (res.status != 200) {
    throw `code ${res.status}`
  }
}

/**
 * login to an account
 * @param {number} phonenum phone number used to login
 * @param {number} countrycode
 * @param {string} password
 */
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

/**
 * Search for a song and add the first result to the track
 * @param {Object[]} track list of songs to play
 * @param {string} keywords used to search in the server
 * @param {Object} channel discord channel for the message to be sent
 */
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

/**
 * Get the url for a song by id
 * @param {number} id
 */
const get_song_url_by_id = async (id) => {
  let song_q = await song_url({
    id: id,
  })

  assert_status_code(song_q)

  let url = song_q.body.data[0].url

  return url
}

/**
 * Get the raw lyric of a song by id
 * @param {number} id
 */
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

const set_user_by_exact_name = (name, channel) => {
  // does this api even exist lmao
  throw "Invalid args"
}

/**
 * Search for an album and return the first few results
 * @param {string} keywords used to search in the server
 */
const search_album = async (keywords) => {
  let search_q = await cloudsearch({
    keywords: keywords,
    type: 10, // for album search
  })

  assert_status_code(search_q)

  let result = []

  if (search_q.body.result.albumCount === 0) {
    return result
  }

  let raw_album = search_q.body.result.albums

  for (
    let i = 0;
    i <
    (search_q.body.result.albumCount > 6 ? 6 : search_q.body.result.albumCount);
    i++
  ) {
    let temp_obj = {
      name: raw_album[i].name,
      id: raw_album[i].id,
      size: raw_album[i].size,
      pic: raw_album[i].picUrl,
      date: raw_album[i].publishTime,
      ar: raw_album[i].artists[0].name,
    }

    result.push(temp_obj)
  }

  return result
}

/**
 * Add all songs from an album to the track
 * @param {Object} al info of an album
 * @param {Object[]} track list of songs to be played
 * @param {Object} channel discord channel for the message to be sent
 */
const add_album = async (al, track, channel) => {
  let album_q = await album({
    id: al.id,
  })

  assert_status_code(album_q)

  let result = album_q.body.songs

  for (let i = 0; i < result.length; i++) {
    let new_song = {
      name: result[i].name,
      id: result[i].id,
      ar: {
        name: result[i].ar[0].name,
        id: result[i].ar[0].id,
      },
      al: {
        name: result[i].al.name,
        id: result[i].al.id,
      },
    }
    track.push(new_song)
  }

  channel.send(`Queued all songs from ${al.name}`)

  return track
}

exports.login = login
exports.search_and_add = search_and_add
exports.get_song_url_by_id = get_song_url_by_id
exports.get_raw_lyric_by_id = get_raw_lyric_by_id
exports.set_user_by_id = set_user_by_id
exports.set_user_by_exact_name = set_user_by_exact_name
exports.search_album = search_album
exports.add_album = add_album
