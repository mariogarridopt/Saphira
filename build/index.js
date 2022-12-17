const packager = require('electron-packager')

const options = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './src/assets/img/icon',
  dir: '.',
  ignore: ['build'],
  out: './build/Release',
  overwrite: true,
  prune: true
}

packager(options, (error, path) => {
  if (error) {
    return (
      console.log(`Error: ${error}`)
    )
  }

  console.log(`Package created, path: ${path}`)
})
