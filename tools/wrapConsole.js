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

module.exports = () => {
  // Outgoing
  window.__originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  const consoleOverrides = {
    ...console,
    log: (...args) => {
      window.__originalConsole.log.apply(this, args);
      if (window.parent) {
          try {
            window.parent.postMessage({
                action: 'log',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    info: (...args) => {
      window.__originalConsole.info.apply(this, args);
      if (window.parent) {
        try {
            window.parent.postMessage({
                action: 'info',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    warn: (...args) => {
      window.__originalConsole.warn.apply(this, args);
      if (window.parent) {
        try {
            window.parent.postMessage({
                action: 'warn',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
    error: (...args) => {
      window.__originalConsole.error.apply(this, args);
      if (window.parent) {
          try {
            window.parent.postMessage({
                action: 'error',
                payload: { args },
            }, '*');
          } catch (err) {
              //
          }
      }
    },
  };
  console = consoleOverrides;

  // Wrap error
  window.onerror = (message, source, lineNumber) => {
      if (window.parent) {
          window.parent.postMessage({
              action: 'error',
              payload: {
                  args: [
                    message,
                    `In file: ${source}`,
                    `Line: ${lineNumber}`,
                  ],
              }
          }, '*');
      }
  };
};
