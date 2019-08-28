export const on = (event, callback) => {
  if (!global.kojiCallbacks) global.kojiCallbacks = {};
  if (!global.kojiCallbacks[event]) global.kojiCallbacks[event] = [];
  global.kojiCallbacks[event].push(callback);
};

export const callEvent = (event, params) => {
  if (global.kojiCallbacks && global.kojiCallbacks[event]) {
    global.kojiCallbacks[event].forEach((callback) => callback.apply(...params));
  }
};
