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

  watcher
    .on('error', (error) => console.error(`[@withkoji/vcc] Watcher error: ${error}`))
    .on('all', () => {
      console.log('[@withkoji/vcc] Rebuilding config...');
      writeConfig();
    })
    .on('ready', () => {
      console.log(`[@withkoji/vcc] Watching ${kojiDir}...`);
    });
};

export default watch;
