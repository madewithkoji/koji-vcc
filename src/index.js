import { resolveSecret } from './tools';

const deprecationNotice = (method, isBreaking = false) => {
  const notice = isBreaking
    ? `[@withkoji/vcc] ${method} is deprectated and no longer available.`
    : `[@withkoji/vcc] ${method} is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!`;
  console.warn(notice);
};

export default {
  config: require('./res/config.json'),
  resolveSecret,

  // Deprecated
  pageLoad: () => deprecationNotice('Koji.pageLoad()'),
  on: () => deprecationNotice('Koji.on()'),
  request: () => deprecationNotice('Koji.request()', true),
  pwaPrompt: () => deprecationNotice('Koji.pwaPrompt()', true),
};
