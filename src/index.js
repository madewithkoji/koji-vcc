import getConfig from './tools/getConfig';
import pageLoad from './pageLoad';

import { callEvent, on } from './kojiCallbacks';

// Keeping this as legacy
// eslint-disable-next-line no-unused-expressions
if (!global.kojiCallbacks) global.kojiCallbacks;

if (window && !window.kojiPageLoadRan) {
  try {
    pageLoad();
    window.kojiPageLoadRan = true;
  } catch (err) {
    window.kojiPageLoadRan = false;
  }
}

export { default as resolveSecret } from './tools/resolveSecret';
export const config = getConfig();

const Koji = {
  callEvent,
  on,
};
export default Koji;
