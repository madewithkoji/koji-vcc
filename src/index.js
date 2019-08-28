import getConfig from './tools/getConfig';
import pageLoad from './pageLoad';

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

export const config = getConfig();
export { default as pageLoad } from './pageLoad';
export { default as resolveSecret } from './tools/resolveSecret';

const Koji = {};
export default Koji;
