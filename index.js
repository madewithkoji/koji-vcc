"use strict";

var wrapConsole = require('./tools/wrapConsole.js');
var buildConfig = require('./tools/buildConfig.js');
var buildRoutes = require('./tools/buildRoutes.js');
var request = require('./tools/request.js');
var watch = require('./watch.js');
global.kojiCallbacks;

function pageLoad() {
    wrapConsole();

    window.addEventListener('message', ({ data }) => {
        // Global context injection
        if (data.action === 'injectGlobal') {
            const { scope, key, value } = data.payload;
            var temp = JSON.parse(window.localStorage.getItem('koji'));
            temp[scope][key] = value;
            exports.config[scope][key] = value;
            exports.routes = buildRoutes(exports.config);
            window.localStorage.setItem('koji', JSON.stringify(temp));

            // update our hooks for an onchange event.
            if(typeof global.kojiCallbacks['change'] === 'function') global.kojiCallbacks['change'](scope, key, value);
        }
    }, false);

    window.localStorage.setItem('koji', JSON.stringify(getConfig()));
    exports.config = getConfig();
    exports.routes = buildRoutes(exports.config);
}

function getConfig() {
    return require('./config.json').config;
}

function on(event, callback) {
    global.kojiCallbacks[event] = callback;
}

exports.pageLoad = pageLoad;
exports.watch = watch;
exports.request = request;
exports.on = on;
