"use strict";

var _wrapConsole = _interopRequireDefault(require("./tools/wrapConsole"));

var _buildConfig = _interopRequireDefault(require("./tools/buildConfig"));

var _buildRoutes = _interopRequireDefault(require("./tools/buildRoutes"));

var _request = _interopRequireDefault(require("./tools/request"));

var _watch = _interopRequireDefault(require("./watch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

if (!global.kojiCallbacks) global.kojiCallbacks;
if (!global.pwaInstall) global.pwaInstall;

function pageLoad(options) {
  if (process.env.NODE_ENV !== 'production') {
    (0, _wrapConsole["default"])();
    window.addEventListener('message', function (_ref) {
      var data = _ref.data;

      // Global context injection
      if (data.action === 'injectGlobal') {
        var _data$payload = data.payload,
            scope = _data$payload.scope,
            key = _data$payload.key,
            value = _data$payload.value;
        var temp = JSON.parse(window.localStorage.getItem('koji'));
        temp[scope][key] = value;
        exports.config[scope][key] = value;
        exports.routes = (0, _buildRoutes["default"])(exports.config);
        window.localStorage.setItem('koji', JSON.stringify(temp)); // update our hooks for an onchange event.

        callEvent('change', [scope, key, value]);
      }
    }, false); //
    // attachVCCTest(getConfig());
  } else {
    // attempt to load a service worker...?
    var sw = require('./serviceWorker.js');

    sw.register();
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      global.pwaInstall = e;
      callEvent('pwaPromptReady');
    });
  }

  window.localStorage.setItem('koji', JSON.stringify(getConfig()));
  exports.config = getConfig();
  exports.routes = (0, _buildRoutes["default"])(exports.config);
}

function getConfig() {
  return require('./config.json').config;
}

function on(event, callback) {
  if (!global.kojiCallbacks) global.kojiCallbacks = {};
  if (!global.kojiCallbacks[event]) global.kojiCallbacks[event] = [];
  global.kojiCallbacks[event].push(callback);
}

function callEvent(event, params) {
  if (global.kojiCallbacks && global.kojiCallbacks[event]) {
    global.kojiCallbacks[event].forEach(function (callback) {
      return callback.apply(null, params);
    });
  }
}

exports.config = getConfig();
exports.routes = (0, _buildRoutes["default"])(exports.config);
exports.pageLoad = pageLoad;
exports.watch = _watch["default"];
exports.request = _request["default"];
exports.on = on;
exports.pwa = global.pwaInstall;

exports.pwaPrompt = function () {
  return global.pwaInstall.prompt();
};

exports.resolveSecret = function (key) {
  if (!process || !process.env || !process.env.KOJI_SECRETS) {
    return null;
  }

  try {
    var parsedSecrets = JSON.parse(process.env.KOJI_SECRETS);
    return parsedSecrets[key] || null;
  } catch (err) {//
  }

  return null;
};