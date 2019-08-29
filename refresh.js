const fs = require('fs')
const path = require('path')
const buildConfig = require('./tools/buildConfig.js')

module.exports = () => {
	// escape our cached configs so koji editor can't store them
	const config = JSON.stringify({config: JSON.parse(buildConfig())}, null, 2)
	
	fs.writeFile(path.join(__dirname, 'config.json'), config, err => {
		if (err) console.error(err)
		console.log('new config')
	})
}
