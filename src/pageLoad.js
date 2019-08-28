import getConfig from './tools/getConfig';
import wrapConsole from './tools/wrapConsole';
import { callEvent } from './kojiCallbacks';

const pageLoad = () => {
  if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('message', ({ data }) => {
      // Global context injection
      if (data.action === 'injectGlobal') {
        const { scope, key, value } = data.payload;
        const temp = JSON.parse(window.localStorage.getItem('koji'));
        temp[scope][key] = value;
        // exports.config[scope][key] = value;
        window.localStorage.setItem('koji', JSON.stringify(temp));

        // update our hooks for an onchange event.
        callEvent('change', [scope, key, value]);
      }
    }, false);

    wrapConsole();
  }

  window.localStorage.setItem('koji', JSON.stringify(getConfig()));
};

export default pageLoad;
