module.exports = {
  info: {
    name: "info",
  },

  run: (client, message, args) => {
    try {
      function Server(name, id, region, joined) {
        this.name = name
        this.id = id
        this.region = region
        this.joined = joined
      }

      const time_convert = (timestamp) => {
        var a = new Date(timestamp)
        var months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
        var year = a.getFullYear()
        var month = months[a.getMonth()]
        var date = a.getDate()

        let time = year + ", " + month + ", " + date
        return time
      }

      let table = []
      let count = 0

      client.guilds.cache.forEach((guild) => {
        // console.log(`${guild.name} | ${guild.id}`);

        table.push(
          new Server(
            guild.name,
            guild.id,
            guild.preferredLocale,
            guild.joinedTimestamp
          )
        )
        count += guild.memberCount
      })

      table.sort(function(a, b) {
        return a.joined - b.joined
      })

      for (t of table) {
        t.joined = time_convert(t.joined)
      }

      console.table(table)
      console.log("TOTAL USERS: " + count)
    } catch (err) {
      console.error(err)
      message.channel.send(`Error (ping): ${err}`)
    }
  },
}
