var buildConfig = require('./tools/buildConfig.js');

module.exports = () => {
    var fs = require('fs');

    // escape our cached configs so koji editor can't store them
    var config = JSON.stringify({ config: JSON.parse(buildConfig()) }, null, 2);
    fs.writeFileSync(`${__dirname}/config.json`, config)
    console.log('new config');
}
