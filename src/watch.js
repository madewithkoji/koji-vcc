import chokidar from 'chokidar';

import findRootDirectory from './tools/findRootDirectory';

import writeConfig from './tools/writeConfig';

const watch = () => {
  // Generate a base config
  writeConfig();

  // Note: Polling is used by default in the container via
  // the CHOKIDAR_USEPOLLING=1 env that is set in the container
  const rootDir = findRootDirectory();
  const watcher = chokidar.watch(rootDir);

  watcher
    .on('error', (error) => console.error(`[@withkoji/vcc] Watcher error: ${error}`))
    .on('all', () => {
      writeConfig();
    })
    .on('ready', () => {
      console.log(`[@withkoji/vcc] Watching ${rootDir}...`);
    });
};

export default watch;
