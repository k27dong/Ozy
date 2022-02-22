const { song_url } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../../helper")

const get_song_url_by_id = async (id, cookie) => {
  let song_q = await song_url({
    id: id,
    cookie: cookie,
  })

  // FIXME: if song_q.body.data.code is -110, then it might
  // indicate that this song is unpaid?
  // console.log(song_q.body)

  assert_query_res(song_q)

  let url = song_q.body.data[0].url

  return url
}

exports.get_song_url_by_id = get_song_url_by_id
