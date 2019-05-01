var buildConfig = require('./tools/buildConfig.js');
var readDirectory = require('./tools/readDirectory.js');
var refresh = require('./refresh.js');

module.exports = () => {
    var fs = require('fs');
    console.log('koji-tools watching');
    const props = JSON.parse(refresh());
    // output what the server wants us to in order to start the preview window
    console.log(props.config.develop.frontend.events.built);
 
    // watch the .koji directory from a node_modules directory...
    readDirectory('..')
    .filter(path => (path.endsWith('koji.json') || path.startsWith('../.koji')) && !path.includes('.koji-resources'))
    .forEach((path) => {
        console.log(path);
        fs.watch(path, () => {
            refresh();
        })
    });
}
