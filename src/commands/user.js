const { assert_queue, get_user_embed_msg } = require("../helper")
const { set_user_by_name } = require("../api/netease/api")

module.exports = {
  info: {
    name: "user",
  },

  run: async (client, message, args) => {
    try {
      let queue = assert_queue(message)
      if (args.length === 0) {
        message.channel.send(
          !!queue.user ? get_user_embed_msg(queue.user) : `No user set!`
        )
      } else if (args.length === 1) {
        let user = await set_user_by_name(args[0])

        if (!user) {
          message.channel.send(`No user found under the name ${args[0]}`)
        } else {
          queue.user = user

          message.channel.send(get_user_embed_msg(queue.user))
        }
      } else {
        throw `Invalid args`
      }
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (user): ${err}`)
    }
  },
}
