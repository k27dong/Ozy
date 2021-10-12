const {
  login_cellphone,
  cloudsearch,
  song_url,
  lyric,
  user_playlist,
  album,
  playlist_detail,
  song_detail,
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

const login = async (config) => {
  return internal_login(config.PHONENUM, config.COUNTRYCODE, config.PASSWORD)
}

/**
 * login to an account
 * @param {number} phonenum phone number used to login
 * @param {number} countrycode
 * @param {string} password
 */
const internal_login = async (phonenum, countrycode, password) => {
  console.log(`Attempting to login ...`)

  let login_q = await login_cellphone({
    phone: phonenum,
    countrycode: countrycode,
    password: password,
  })

  if (login_q.body.code == 200) {
    console.log(`logged in.`)
    console.log(`User: ${login_q.body.profile.nickname}`)
    return login_q.body
  } else {
    console.log(`Default login error: code ${login_q.body.code}\n`)
  }
}

/**
 * Get the url for a song by id
 * @param {number} id
 */
const get_song_url_by_id = async (id, cookie) => {
  let song_q = await song_url({
    id: id,
    cookie: cookie,
  })

  // FIXME: if song_q.body.data.code is -110, then it might
  // indicate that this song is unpaid?
  // console.log(song_q.body)

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

const set_user_by_name = async (name) => {
  let search_q = await cloudsearch({
    keywords: name,
    type: 1002,
  })

  assert_status_code(search_q)

  if (!search_q.body.result.userprofiles) {
    return null
  }

  let default_user = search_q.body.result.userprofiles[0]

  return default_user
}

const get_user_playlist = async (id) => {
  let playlist_q = await user_playlist({
    uid: id,
  })

  playlist = []

  if (!playlist_q.body.playlist.length === 0) {
    return playlist
  }

  for (let p of playlist_q.body.playlist) {
    if (p.creator.userId === id) {
      playlist.push({
        name: p.name,
        id: p.id,
        play_count: p.playCount,
        count: p.trackCount,
      })
    }
  }

  return playlist
}

const get_songs_from_playlist = async (list) => {
  let playlist_q = await playlist_detail({
    id: list.id,
  })

  let raw_songs = []
  let id_chunks = []
  let songs = []

  if (playlist_q.body.code === 404) {
    return raw_songs
  }

  raw_songs = playlist_q.body.playlist.trackIds

  while (raw_songs.length > 0) {
    id_chunks.push(raw_songs.splice(0, 999))
  }

  for (let temp = 0; temp < id_chunks.length; temp++) {
    let curr_ids = id_chunks[temp]
    let ids = ""

    for (let i = 0; i < curr_ids.length; i++) {
      if (i === 0) {
        ids += `${curr_ids[i].id}`
      } else {
        ids += `,${curr_ids[i].id}`
      }
    }

    let songs_q = await song_detail({
      ids: ids,
    })

    if (!songs_q.body.songs || songs_q.body.songs.length === 0) {
      return songs
    }

    for (let s of songs_q.body.songs) {
      songs.push({
        name: s.name,
        id: s.id,
        ar: {
          name: s.ar[0].name,
          id: s.ar[0].id,
        },
        al: {
          name: s.al.name,
          id: s.al.id,
        },
        source: "netease",
      })
    }
  }

  return songs
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
    (search_q.body.result.albums.length > 10
      ? 10
      : search_q.body.result.albums.length);
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

const get_first_song_result = async (keywords) => {
  let search_q = await cloudsearch({
    keywords: keywords,
  })

  assert_status_code(search_q)

  if (search_q.body.result.songCount === 0) {
    return undefined
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
    source: "netease",
  }

  return new_song
}

const extract_album_songs = async (al) => {
  let album_q = await album({
    id: al.id,
  })

  assert_status_code(album_q)

  let result = album_q.body.songs
  let new_songs = []

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
      source: "netease",
    }
    new_songs.push(new_song)
  }

  return new_songs
}

exports.login = login
exports.get_song_url_by_id = get_song_url_by_id
exports.get_raw_lyric_by_id = get_raw_lyric_by_id
exports.set_user_by_name = set_user_by_name
exports.search_album = search_album
exports.get_first_song_result = get_first_song_result
exports.extract_album_songs = extract_album_songs
exports.get_user_playlist = get_user_playlist
exports.get_songs_from_playlist = get_songs_from_playlist
