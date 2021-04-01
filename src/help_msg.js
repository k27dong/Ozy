const help = (cmd) => {
  const FULL_COMMAND_LIST =
    "```\
Full command list: \n\
*album keyword1 (keywords2) ... \n\
*clear \n\
*help \n\
*jump pos \n\
*lyric \n\
*next \n\
*pause \n\
*play keyword1 (keywords2) ... \n\
*play youtube_url \n\
*playfile uploaded_file \n\
*playlist \n\
*prev \n\
*queue (full | amount) \n\
*remove pos (pos2) (pos3->pos4) ... \n\
*resume \n\
*shuffle \n\
*stop \n\
*user username \n\n\
use *help <command> to check detailed explaination \
```"

  const ALBUM =
    "```\
*album [keyword] \n\
Aliases: pa, playalbum \n\n\
Search for an album \n\
Reply to the returned message to select an album and add it to the track. \n\n\
example: *pa street legal dylan\
```"

  const CLEAR = "```\
*clear \n\n\
Removes all songs from the list.\
```"

  const JUMP =
    "```\
*jump [position] \n\
Aliases: j, goto \n\n\
Jumps to a specified position in the track\n\n\
example: *j 10\
```"

  const NEXT = "```\
*next \n\
Aliases: n, skip \n\n\
Skips to the next song.\
```"

  const PAUSE = "```\
*pause \n\n\
Pauses the song.\
```"

  const PLAY =
    "```\
*play [link or keywords] \n\
Aliases: p \n\n\
Search for the song in Netease and add the first result to the track \n\
If it's a link, then it adds the url\n\n\
example:\n\
  *p free four pink floyd\n\
  *p https://www.youtube.com/watch?v=DNvOajRSfZ8\
```"

  const PLAYFILE =
    "```\
*playfile \n\
Aliases: f, pf \n\n\
Adds the attached file to the track.\
```"

  const PLAYLIST =
    "```\
*playlist \n\
Aliases: list \n\n\
List all the playlist from the Netease user (set by using '*user') \n\
Reply to the returned message to select a playlist and add it to the track. \n\n\
```"

  const PREV =
    "```\
*prev \n\
Aliases: b, back \n\n\
Skips to the previous song.\
```"

  const QUEUE =
    "```\
*queue [full | amount] \n\
Aliases: q \n\n\
Displays the queue\n\
An additional parameter can be added to set the display amount\n\n\
example:\n\
  *q \n\
  *q 30\n\
  *q full\
```"

  const REMOVE =
    "```\
*remove [positions] \n\
Aliases: rm \n\n\
Removes the specified song(s) from the queue\n\n\
example:\n\
  *rm 2 5 7 13 (removes 2, 5, 7, 13)\n\
  *rm 4 8->10 (removes 4, 8, 9, 10)\
```"

  const RESUME = "```\
*resume \n\n\
Resumes the paused song.\
```"

  const SHUFFLE = "```\
*shuffle \n\n\
Shuffles the remaining queue.\
```"

  const STOP =
    "```\
*stop \n\
Aliases: leave, reset \n\n\
Clears the queue and leaves the voice channel\
```"

  const USER =
    "```\
*user [Netease username] \n\n\
Sets the user for this bot\n\
After user is set, you can use '*playlist' to display all the playlists created by this user.\n\n\
example: *user 麻辣烤鱼别放大葱\
```"

  const HELP = {
    album: ALBUM,
    clear: CLEAR,
    jump: JUMP,
    next: NEXT,
    pause: PAUSE,
    play: PLAY,
    playfile: PLAYFILE,
    playlist: PLAYLIST,
    prev: PREV,
    queue: QUEUE,
    remove: REMOVE,
    resume: RESUME,
    shuffle: SHUFFLE,
    stop: STOP,
    user: USER,
    help: FULL_COMMAND_LIST,
  }

  return HELP[cmd]
}

const GENERAL_HELP_MESSAGE = `My prefix is \`*\`\n\
Join a voice channel and use \`*play\` to play some songs\n\
Type \`*help\` to check the full list of commands`

exports.help = help
exports.GENERAL_HELP_MESSAGE = GENERAL_HELP_MESSAGE
