/**
 * koji_utilities/wrapConsole.js
 * 
 * What it Does:
 *   This utility wraps around the normal console.log() function
 *   in order to allow koji to display the logs from your app in
 *   the embedded preview within your editor. 
 * 
 * What to Change:
 *   This file is fairly complicated and deals with internal koji
 *   schemas about how to handle iframe postMessage's, so changing
 *   around how this works is not advisable.
 * 
 * How to Use:
 *   Import this file and run it as a function once your component
 *   has mounted, see common/App.js to see an implementation. This
 *   is already done for you in this project so don't worry about it.
 */
"use strict";

var _this = void 0;

module.exports = function () {
  // Outgoing
  window.__originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };

  try {
    var consoleOverrides = {
      // ...console,
      log: function log() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        window.__originalConsole.log.apply(_this, args);

        if (window.parent) {
          try {
            window.parent.postMessage({
              action: 'log',
              payload: {
                args: args
              }
            }, '*');
          } catch (err) {//
          }
        }
      },
      info: function info() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        window.__originalConsole.info.apply(_this, args);

        if (window.parent) {
          try {
            window.parent.postMessage({
              action: 'info',
              payload: {
                args: args
              }
            }, '*');
          } catch (err) {//
          }
        }
      },
      warn: function warn() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        window.__originalConsole.warn.apply(_this, args);

        if (window.parent) {
          try {
            window.parent.postMessage({
              action: 'warn',
              payload: {
                args: args
              }
            }, '*');
          } catch (err) {//
          }
        }
      },
      error: function error() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        window.__originalConsole.error.apply(_this, args);

        if (window.parent) {
          try {
            window.parent.postMessage({
              action: 'error',
              payload: {
                args: args
              }
            }, '*');
          } catch (err) {//
          }
        }
      }
    };
    console = consoleOverrides;
  } catch (err) {} //
  // Wrap error


  window.onerror = function (message, source, lineNumber) {
    if (window.parent) {
      window.parent.postMessage({
        action: 'error',
        payload: {
          args: [message, "In file: ".concat(source), "Line: ".concat(lineNumber)]
        }
      }, '*');
    }
  };
};