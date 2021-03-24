const PREFIX = "!"

const COLOR = "#799089"

const EVENTS_DIR = "events"

const COMMANDS_DIR = "commands"

const NUM_EMOJI = [
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
]

const SUPPORTED_AUDIO_FORMAT = [
  "mp3",
  "flac",
  "ape",
  "aac",
  "ogg",
  "wav",
  "m4a",
]

const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u

exports.PREFIX = PREFIX
exports.NUM_EMOJI = NUM_EMOJI
exports.EVENTS_DIR = EVENTS_DIR
exports.COMMANDS_DIR = COMMANDS_DIR
exports.SUPPORTED_AUDIO_FORMAT = SUPPORTED_AUDIO_FORMAT
exports.REGEX_CHINESE = REGEX_CHINESE
