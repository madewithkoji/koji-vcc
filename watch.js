var buildConfig = require('./tools/buildConfig.js');
var readDirectory = require('./tools/readDirectory.js');
var refresh = require('./refresh.js');
var findRootDirectory = require('./tools/findRootDirectory.js');

module.exports = () => {
    var fs = require('fs');
    console.log('koji-tools watching');
    const props = JSON.parse(refresh());
    // output what the server wants us to in order to start the preview window
    console.log(props.config.develop.frontend.events.built);
 
    // watch the .koji directory from a node_modules directory...
    let root = findRootDirectory();
    readDirectory(root)
    .filter(path => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'))
    .forEach((path) => {
        fs.watch(path, () => {
            refresh();
        })
    });
}
