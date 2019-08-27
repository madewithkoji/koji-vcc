import wrapConsole from './tools/wrapConsole';
import buildConfig from './tools/buildConfig';
import request from './tools/request';
import watch from './watch';

if(!global.kojiCallbacks) global.kojiCallbacks;

function pageLoad(options) {
    if(process.env.NODE_ENV !== 'production') {
        wrapConsole();

        window.addEventListener('message', ({ data }) => {
            // Global context injection
            if (data.action === 'injectGlobal') {
                const { scope, key, value } = data.payload;
                var temp = JSON.parse(window.localStorage.getItem('koji'));
                temp[scope][key] = value;
                exports.config[scope][key] = value;
                window.localStorage.setItem('koji', JSON.stringify(temp));

                // update our hooks for an onchange event.
                callEvent('change', [scope, key, value]);
            }
        }, false);
    }

    window.localStorage.setItem('koji', JSON.stringify(getConfig()));
    exports.config = getConfig();
}

function getConfig() {
    return require('./config.json').config;
}

function on(event, callback) {
    if(!global.kojiCallbacks) global.kojiCallbacks = {};
    if(!global.kojiCallbacks[event]) global.kojiCallbacks[event] = [];
    global.kojiCallbacks[event].push(callback);
}

function callEvent(event, params) {
    if(global.kojiCallbacks && global.kojiCallbacks[event]) {
        global.kojiCallbacks[event].forEach((callback) => callback.apply(null, params));
    }
}

exports.config = getConfig();
exports.pageLoad = pageLoad;
exports.watch = watch;
exports.request = request;
exports.on = on;

exports.resolveSecret = (key) => {
    if (!process || !process.env || !process.env.KOJI_SECRETS) {
        return null;
    }
    try {
        const parsedSecrets = JSON.parse(process.env.KOJI_SECRETS);
        return parsedSecrets[key] || null;
    } catch (err) {
        //
    }
    return null;
}
