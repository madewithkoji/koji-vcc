const postToParent = ({ action, payload }) => {
  try {
    if (window && window.parent) {
      window.parent.postMessage({
        action,
        payload,
      }, '*');
    }
  } catch (err) {
    // err
  }
};

const wrapConsole = () => {
  try {
    if (window && window.console) {
      // Log
      const consoleLog = window.console.log;
      window.console.log = (...args) => {
        consoleLog.apply(this, args);
        postToParent({
          action: 'log',
          payload: { args },
        });
      };

      // Warn
      const consoleWarn = window.console.warn;
      window.console.warn = (...args) => {
        consoleWarn.apply(this, args);
        postToParent({
          action: 'warn',
          payload: { args },
        });
      };

      // Info
      const consoleInfo = window.console.info;
      window.console.info = (...args) => {
        consoleInfo.apply(this, args);
        postToParent({
          action: 'info',
          payload: { args },
        });
      };

      // Error
      const consoleError = window.console.error;
      window.console.error = (...args) => {
        consoleError.apply(this, args);
        postToParent({
          action: 'error',
          payload: { args },
        });
      };
    }

    window.onerror = (message, source, lineNumber) => {
      postToParent({
        action: 'error',
        payload: {
          args: [
            message,
            `In file: ${source}`,
            `Line: ${lineNumber}`,
          ],
        },
      });
    };
  } catch (err) {
    // err
  }
};

export default wrapConsole;
