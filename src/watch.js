import chokidar from 'chokidar';

import findRootDirectory from './tools/findRootDirectory';

import writeConfig from './tools/writeConfig';

const watch = () => {
  // Generate a base config
  writeConfig();

  // Note: Polling is used by default in the container via
  // the CHOKIDAR_USEPOLLING=1 env that is set in the container
  const kojiDir = `${findRootDirectory()}/.koji`;
  const watcher = chokidar.watch(kojiDir);

  // eslint-disable-next-line no-unused-vars
  let watcherDebounce = null;

  watcher
    .on('error', (error) => console.error(`[@withkoji/vcc] Watcher error: ${error}`))
    .on('all', () => {
      console.log('[@withkoji/vcc] Rebuilding config...');
      watcherDebounce = setTimeout(() => writeConfig(), 250);
    })
    .on('ready', () => {
      console.log(`[@withkoji/vcc] Watching ${kojiDir}...`);
    });
};

export default watch;
