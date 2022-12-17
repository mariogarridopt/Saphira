const config = require('../config')
const utils = require('./utils')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(`${config.paths.application}/db.json`)
const db = low(adapter)

module.exports = class {
  constructor (parent) {
    this.parent = parent
    this.options = parent.preferencesModule

    this.screenshots = []

    db.defaults({ screenshots: [] })
      .write()
  }

  addScreenshot (url) {
    let screenshot = {
      url: url,
      timestamp: utils.getTimestamp(true)
    }

    this.screenshots.push(screenshot)

    db.get('screenshots')
      .push({ url: screenshot })
      .write()
  }

  getHistory () {
    let screenshots = db.get('screenshots')
      .map('url')
      .orderBy('timestamp', 'asc')
      .value()

    return screenshots
  }
}
