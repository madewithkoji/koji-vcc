"use strict";

var wrapConsole = require('./tools/wrapConsole.js');
var buildConfig = require('./tools/buildConfig.js');
var buildRoutes = require('./tools/buildRoutes.js');
var request = require('./tools/request.js');

function pageLoad() {
    wrapConsole();
    console.log('[koji] frontend started');

    window.addEventListener('message', ({ data }) => {
        // Global context injection
        if (data.action === 'injectGlobal') {
            console.log('new config stuff');
            const { scope, key, value } = data.payload;
            var temp = JSON.parse(window.localStorage.getItem('koji'));
            temp[scope][key] = value;
            exports.config[scope][key] = value;
            exports.routes = buildRoutes(exports.config);
            window.localStorage.setItem('koji', JSON.stringify(temp));
        }
    }, false);

    window.localStorage.setItem('koji', JSON.stringify(getConfig()));
    exports.config = getConfig();
    exports.routes = buildRoutes(exports.config);
}

function setup() {
    console.log('server initted');
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
        console.log('New Configs Loaded');
    });
}

function getConfig() {
    delete require.cache[require.resolve('./config.json')];
    return require('./config.json').config;
}

exports.wrapConsole = wrapConsole;
exports.buildConfig = buildConfig;
exports.pageLoad = pageLoad;
exports.refresh = refresh;
exports.setup = setup;
exports.request = request;
