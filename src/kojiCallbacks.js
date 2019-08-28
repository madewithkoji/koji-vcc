export const on = (event, callback) => {
  console.log('on', event);
  if (!global.kojiCallbacks) global.kojiCallbacks = {};
  if (!global.kojiCallbacks[event]) global.kojiCallbacks[event] = [];
  global.kojiCallbacks[event].push(callback);
};

export const callEvent = (event, params) => {
  console.log('call', event);
  if (global.kojiCallbacks && global.kojiCallbacks[event]) {
    global.kojiCallbacks[event].forEach((callback) => callback.apply(...params));
  }
};
