const request = require('request')
const fs = require('fs')
const config = require('../../config')

module.exports = class {
  static upload (file, callback) {
    console.log('Uploading image to imgur...')

    const imgur = config.services.imgur;

    if (!imgur.token) {
      return callback(null, 'No authorization token found in configuration')
    }

    const options = {
      url: imgur.endpoint,
      headers: {
        'Authorization': `Client-ID ${imgur.token}`
      }
    }

    const post = request.post(options, (error, req, body) => {
      if (error) {
        return callback(null, error)
      }

      try {
        const data = JSON.parse(body).data
        const link = { link: data.link }

        callback(link)
      } catch (error) {
        return callback(null, error)
      }
    })

    let form = post.form()

    form.append('type', 'file')
    form.append('image', fs.createReadStream(file))
  }
}
