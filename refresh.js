var buildConfig = require('./tools/buildConfig.js');

module.exports = () => {
    var fs = require('fs');
        console.log(__dirname);

    // escape our cached configs so koji editor can't store them
    var config = JSON.stringify({ config: JSON.parse(buildConfig()) }, null, 2);
    fs.writeFile(`${__dirname}/config.json`, config, (err) => {
        if (err) console.log(err);
        console.log('new config');
    });
    return config;
}
