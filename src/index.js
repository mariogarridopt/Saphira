const fs = require('fs-extra');
const os = require('os');

const electron = require('electron');
const AutoLaunch = require('auto-launch');

const ShortcutManager = require('./module/shortcutManager');

const config = require('./config');

const { Tray, Menu, Notification, shell } = electron;

new (class {
  constructor () {
    // create application home dir if it doesn't exist
    fs.ensureDirSync(config.paths.uploads);

    this.appPath = electron.app.getPath('exe').split('.app/Content')[0] + '.app';

    if (!this.appPath.includes('electron')) {
      this.appLauncher = new AutoLaunch({
        name: 'Saphira',
        path: this.appPath
      });
    }

    this.optionsModule = new (require('./module/options'))(this);
    this.optionsModule.saveOptions(config.defaults);

    this.screenshotModule = new (require('./module/screenshot'))(this);
    this.historyModule = new (require('./module/history'))(this);

    const startAtLogin = this.optionsModule.getOption('startAtLogin');

    if (startAtLogin && this.appLauncher) {
      this.appLauncher.enable();
    }

    electron.ipcMain.handle('getVersion', () => {
      return require('../package').version;
    })

    // initialize menu bar
    this.createTray();
  }

  createTray () {
    this.app = electron.app;

    if (os.platform() === 'darwin') {
      this.app.dock.hide();
    }

    this.app.commandLine.appendSwitch('disable-renderer-backgrounding');

    this.app.on('ready', () => {
      this.shortcutManager = new ShortcutManager(this);
      this.tray = new Tray(config.icons.tray.default);

      this.menu = Menu.buildFromTemplate([{
        label: 'Take Screenshot',
        type: 'normal',
        click: () => {
          this.screenshotModule.captureSelection()
        }
      },

      //{
      //  label: 'Preferences...',
      //  type: 'normal',
      //  accelerator: 'CommandOrControl+,',
      //  click: () => {
      //    this.preferencesModule.showWindow()
      //  }
      //},

      { type: 'separator' },

      {
        label: 'Quit',
        type: 'normal',
        accelerator: 'CommandOrControl+Q',
        click: () => {
          this.app.quit()
        }
      }
      ])

      this.tray.on('drop-files', (event, files) => {
        const file = files[0]
        const ext = file.split('.').pop()

        const allowed = ['png', 'jpg', 'jpeg', 'gif']

        if (allowed.includes(ext)) {
          console.log('Uploading image...')

          this.screenshotModule.upload(file, (result, error) => {
            if (!error) {
              this.historyModule.addScreenshot(result)
              this.showNotification('Image has been uploaded and copied to your clipboard.', 'Image Uploaded', result.link)
            } else {
              this.showNotification('Image failed to upload.', 'Upload Error')
            }
          }, true)
        }
      })

      Menu.setApplicationMenu(this.menu)

      this.tray.setToolTip('Saphira')
      this.tray.setContextMenu(this.menu)
    })
  }

  showNotification (message, title, url) {
    let notification = new Notification({
      title: title,
      body: message,
      sound: 'default'
    })

    notification.on('click', () => {
      if (url) shell.openExternal(url)
    })

    notification.show()
  }

  setIcon (type) {
    this.tray.setImage(config.icons.tray[type])
  }
})()
