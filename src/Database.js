const {
  connect,
  MongoClient
} = require('mongodb')

class Database {
  constructor (name, url, ops) {
    this.name = name
    this.url = url
    this.ops = ops
  }

  close () {
    return this.client.close()
  }

  async connect () {
    const mongo = await connect(this.url, this.ops)
    if (mongo instanceof MongoClient) {
      this.db = mongo.db(this.name)
      this.client = mongo
    }
    return this
  }

  // -----------

  addChannel (id, channel) {
    return this.guilds.updateOne({ id }, {
      $push: { channels: channel }
    })
  }

  addGuild (doc) {
    return this.guilds.insertOne(doc)
  }

  async checkForChannel (id, channel) {
    const doc = await this.getGuild(id)
    return doc.channels.includes(channel)
  }

  removeChannel (id, channel) {
    return this.guilds.updateOne({ id }, {
      $pull: { channels: channel }
    })
  }

  removeGuild (id) {
    return this.guilds.deleteOne({ id })
  }

  getGuild (id) {
    return this.guilds.findOne({ id })
  }

  get guilds () {
    return this.db.collection('guilds')
  }

  // ---------

  static guildDoc (id, channels = []) {
    return {
      id,
      channels
    }
  }
}

module.exports = { Database }
