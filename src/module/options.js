const fs = require('fs')
const config = require('../config')

module.exports = class {
    constructor(parent) {
        this.parent = parent

        const path = config.paths.application

        try {
            this.options = require(`${path}/config.json`)
        } catch (e) {
            this.options = {}
        }
    }

    saveOptions(options) {
        if (options !== undefined) this.options = options

        const json = JSON.stringify(this.options)
        const path = `${config.paths.application}/config.json`

        fs.writeFileSync(path, json)
    }
    getOption(key) {
        return this.options[key]
    }
    setOption(key, val) {
        this.options[key] = val
        return this.options[key]
    }
}