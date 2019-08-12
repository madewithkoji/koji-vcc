var buildConfig = require('./tools/buildConfig.js');
var readDirectory = require('./tools/readDirectory.js');
var refresh = require('./refresh.js');
var findRootDirectory = require('./tools/findRootDirectory.js');

module.exports = () => {
    var fs = require('fs');
    console.log('koji-tools watching');
    // const props = JSON.parse(refresh());
    // output what the server wants us to in order to start the preview window
    // console.log(props.config.develop.frontend.events.built);
    // NOTE: figure out what to do about this one, because we cant output this before the server is ready...
 
    // make sure that its in there to start, postinstall has been doing so weird stuff
    refresh();
    // watch the .koji directory from a node_modules directory...
    let root = findRootDirectory();
    readDirectory(root)
        .filter(path => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'))
        .forEach((path) => {
            console.log('Watching', path);
            
            let fsWait = false;
            fs.access(path, fs.F_OK, (err) => {
                if (!err) {
                    fs.watch(path, (eventType, filename) => {
                        if (fsWait) return;
                        fsWait = setTimeout(() => {
                            fsWait = false;
                        }, 1000);
                        console.log(eventType, filename);
                        refresh();
                    });
                }
            });
        });
}
