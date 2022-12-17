const childProcess = require('child_process')

const fs = require('fs')
const os = require('os')

const config = require('../config')
const utils = require('./utils')

const { clipboard } = require('electron')

module.exports = class {
  constructor (parent) {
    this.parent = parent
    this.options = parent.optionsModule
    this.directory = config.paths.uploads

    if (this.options.getOption('uploadPath')) {
      this.directory = this.options.getOption('uploadPath')
    }
  }

  captureSelection () {
    this.execute(this.directory, (file, error) => {
      this.upload(file, (result, error) => {
        if (!error) {
          console.log(result)

          this.parent.historyModule.addScreenshot(result)
          this.parent.showNotification('Screenshot has been uploaded and copied to your clipboard.', 'Screenshot Uploaded', result.link)
        } else {
          console.log(error)

          this.parent.showNotification('Screenshot failed to upload.', 'Upload Error')
        }
      })
    })
  }

  upload (file, callback, tray) {
    try {
      fs.statSync(file);

      this.parent.setIcon('active');

      const defaultService = config.defaults.services.uploadService;

      let serviceModule = require('./services/' + defaultService);

      serviceModule.upload(file, (result, error) => {
        if (!error) {
          if (this.options.getOption('deleteOnUpload') && !tray) {
            fs.unlink(file, (error) => {
              if (error) {
                callback(null, error)
              }
            })
          }
          
          if (result.link) {
            console.log("Add to clipboard...");
            clipboard.writeText(result.link)
          }

          console.log("Callback:");
          callback(result, false);

          console.log('Upload successful!')
        } else {
          callback(null, error)
        }
      })
    } catch (error) {
      callback(null, error)
    }

    this.parent.setIcon('default')
  }

  execute (dir, callback) {
    const name = utils.getTimestamp()
    const output = `${dir}/${name}.png`

    let command

    if (os.platform() === 'darwin') command = `/usr/sbin/screencapture -i -x ${output}`
    if (os.platform() === 'win32') {
      const binary = '../../app/bin/boxcutter.exe'

      command = `${binary} "${output}"`
    }

    console.log('Capturing selection...')

    childProcess.exec(command, (error, stdout, stderr) => {
      if (!error) {
        console.log('Selection captured!')
        return callback(output)
      }

      console.log('Error while capturing!')

      return callback(null, error)
    })
  }
}
