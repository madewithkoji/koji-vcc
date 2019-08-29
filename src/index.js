import resolveSecret from './tools/resolveSecret';

function deprecationNotice(method, isBreaking = false) {
  if (isBreaking) {
    console.warn(`[@withkoji/vcc] ${method} is deprectated and no longer available.`);
  } else {
    console.warn(`[@withkoji/vcc] ${method} is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!`);
  }
}

export default {
  config: require('./res/config.json'),
  resolveSecret,

  // Deprecated
  pageLoad: () => deprecationNotice('Koji.pageLoad()'),
  on: () => deprecationNotice('Koji.on()'),
  request: () => deprecationNotice('Koji.request()', true),
  pwaPrompt: () => deprecationNotice('Koji.pwaPrompt()', true),
};
