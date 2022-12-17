const os = require('os')

let config = {}

config.defaults = {
  startAtLogin: false,
  deleteOnUpload: true,
  services: {
    uploadService: 'vgy',
  },

  shortcuts: {
    screenshotSelection: 'command+alt+s'
  }
}

config.icons = {
  app: `${__dirname}/assets/img/icon.png`,
  tray: {
    default: `${__dirname}/assets/img/menubar/IconTemplate@2x.png`,
    active: `${__dirname}/assets/img/menubar/active/IconTemplate@2x.png`
  }
}

config.paths = {
  application: `${os.homedir()}/.saphira`,
  uploads: `${os.homedir()}/.saphira/uploads`
}

config.services = {
  vgy: {
    name: 'vgy.me',
    token: 'vSC16ZFjziI8KcERZkIHvwGmiINsEO8G',
    endpoint: 'https://vgy.me/upload'
  },
  imgur: {
    name: 'Imgur',
    token: '',
    endpoint: 'https://api.imgur.com/3/upload'
  }
}

module.exports = config
