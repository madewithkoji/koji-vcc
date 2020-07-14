import InstantRemixing from './InstantRemixing';
import FeedSdk from './FeedSdk';

function deprecationNotice(method, isBreaking = false) {
  if (isBreaking) {
    console.warn(
      `[@withkoji/vcc] ${method} is deprecated and no longer available.`,
    );
  } else {
    console.warn(
      `[@withkoji/vcc] ${method} is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!`,
    );
  }
}

let config = require('./res/config.json');

export default {
  config,

  // Deprecated
  resolveSecret: () => deprecationNotice('Koji.resolveSecret()', true),
  enableConfigDidChange: () => deprecationNotice('Koji.enableConfigDidChange()', true),
  configDidChange: () => deprecationNotice('Koji.configDidChange()', true),
  pageLoad: () => deprecationNotice('Koji.pageLoad()'),
  on: () => deprecationNotice('Koji.on()'),
  request: () => deprecationNotice('Koji.request()', true),
  pwaPrompt: () => deprecationNotice('Koji.pwaPrompt()', true),
};

// Named exports
export {
  InstantRemixing,
  FeedSdk,
};
