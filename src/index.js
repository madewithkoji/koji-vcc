import resolveSecret from './tools/resolveSecret';

function deprecationNotice(method, isBreaking = false) {
  if (isBreaking) {
    console.warn(`[@withkoji/vcc] ${method} is deprecated and no longer available.`);
  } else {
    console.warn(`[@withkoji/vcc] ${method} is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!`);
  }
}

const config = {
  config: require('./res/config.json'),
  resolveSecret,

  // Deprecated
  pageLoad: () => deprecationNotice('Koji.pageLoad()'),
  on: () => deprecationNotice('Koji.on()'),
  request: () => deprecationNotice('Koji.request()', true),
  pwaPrompt: () => deprecationNotice('Koji.pwaPrompt()', true),
};

if (config.config.errors.length > 0) {
  config.config.errors.forEach((error) => {
    console.error(error);
  });
}

export default config;
