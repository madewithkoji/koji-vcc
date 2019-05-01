"use strict";

var wrapConsole = require('./tools/wrapConsole.js');
var buildConfig = require('./tools/buildConfig.js');
var buildRoutes = require('./tools/buildRoutes.js');
var request = require('./tools/request.js');
var setup = require('./setup.js');

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

function getConfig() {
    delete require.cache[require.resolve('./config.json')];
    return require('./config.json').config;
}

exports.pageLoad = pageLoad;
exports.setup = setup;
exports.request = request;
