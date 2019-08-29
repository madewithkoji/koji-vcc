import getConfig from './tools/getConfig';

export const config = getConfig();
export { default as resolveSecret } from './tools/resolveSecret';

const Koji = {
  get config() {
    console.warn('Koji.config is deprecated.\nYou can access the configuration by calling `import { config } from \'koji-vcc\'`');
    return {};
  },
  pageLoad() {
    console.warn('Koji.pageLoad() is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!');
  },
};

// Note: The default export is only for providing helpful feedback to developers
// that are migrating from @koji-tools
export default Koji;
