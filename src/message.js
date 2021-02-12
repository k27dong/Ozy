const ozy_poem =
  '```\
In Egypt\'s sandy silence, all alone,\n\
Stands a gigantic Leg, which far off throws\n\
The only shadow that the Desert knows:—\n\
"I am great OZYMANDIAS," saith the stone,\n\
"The King of Kings; this mighty City shows\n\
The wonders of my hand."— The City\'s gone,—\n\
Naught but the Leg remaining to disclose\n\
The site of this forgotten Babylon.\n\
```'

const help_array = [
  "```\
Johnny's in the basement\n\
Mixing up the medicine\n\
I'm on the pavement\n\
Thinking about the government```",
  "```\
The man in the trench coat\n\
Badge out, laid off\n\
Says he's got a bad cough\n\
 Wants to get it paid off```",
  "```\
A man in the coonskin cap\n\
In the pig pen\n\
Wants eleven dollar bills\n\
You only got ten```",
  "```\
The phone's tapped anyway\n\
Maggie says that many say\n\
They must bust in early May\n\
Orders from the D.A.```",
  "```\
Walk on your tip toes\n\
Don't tie no bows\n\
Better stay away from those\n\
That carry around a fire hose```",
  "```\
Keep a clean nose\n\
Watch the plain clothes\n\
You don't need a weather man\n\
To know which way the wind blows```",
  "```\
Try hard, get barred\n\
Get back, write braille\n\
Get jailed, jump bail\n\
Join the army if you fail```",
  "```\
Girl by the whirlpool\n\
Lookin' for a new fool\n\
Don't follow leaders\n\
Watch the parkin' meters```",
  "```\
Please her, please him, buy gifts\n\
Don't steal, don't lift\n\
Twenty years of schooling\n\
And they put you on the day shift```",
  "```\
Better jump down a manhole\n\
Light yourself a candle\n\
Don't wear sandals\n\
Try to avoid the scandals```",
]

const display_track = (track) => {
  if (track.length === 0) {
    return "```Track empty!```"
  }

  let queue = "```"
  for (let i = 0; i < track.length; i++) {
    let item = track[i].song
    queue += `${track[i].pos + 1}) ${item.name} (${item.ar.name})`
    queue += track[i].curr ? `   ◄———— \n` : `\n`
  }

  queue += "```"

  return queue
}

const help_1 = () => {
  let h = "```"

  h += "```"

  return h
}

exports.display_track = display_track
exports.ozy_poem = ozy_poem
exports.help_1 = help_1
