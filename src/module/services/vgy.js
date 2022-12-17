const request = require('request')
const fs = require('fs')
const config = require('../../config')

module.exports = class {
  static upload (file, callback) {
    console.log('Uploading image to cgy...')

    const vgy = config.services.vgy

    if (!vgy.token) {
      return callback(null, 'No authorization token found in configuration')
    }

    const options = {
      url: vgy.endpoint,
    }

    const post = request.post(options, (error, req, body) => {
      if (error) {
        return callback(null, error)
      }

      try {
        const data = JSON.parse(body)
        const link = { link: data.image }

        callback(link)
      } catch (error) {
        return callback(null, error)
      }
    })

    let form = post.form()

    form.append('file', fs.createReadStream(file))
    form.append('userkey', vgy.token)
  }
}
