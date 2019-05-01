var buildConfig = require('./tools/buildConfig.js');

module.exports = () => {
    console.log('koji-tools setup');
    const chokidar = require('chokidar');
    refresh();
 
    // watch the .koji directory from a node_modules directory...
    chokidar.watch(`${__dirname}/../../.koji`, ).on('all', (event, path) => {
        if(event === 'change' && path.endsWith('.json')) refresh();
    });
}

function refresh() {
    var fs = require('fs');
    // escape our cached configs so koji editor can't store them
    var config = JSON.stringify({ config: JSON.parse(buildConfig()) });
    fs.writeFile(`${__dirname}/config.json`, config, (err) => {
        if (err) console.log(err);
        console.log('new config');
    });
}
