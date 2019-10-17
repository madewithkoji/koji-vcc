import chokidar from 'chokidar';
import { readDirectory, findRootDirectory, writeConfig } from './tools';

const watch = () => {
  // Generate a base config
  writeConfig();

  // Watch the .koji directory from a node_modules directory
  const files = readDirectory(findRootDirectory());

  // Note: Polling is used by default in the container via
  // the CHOKIDAR_USEPOLLING=1 env that is set in the container
  const kojiDir = `${findRootDirectory()}/.koji`;
  const watcher = chokidar.watch(kojiDir);

  // eslint-disable-next-line no-unused-vars
  let watcherDebounce = null;

  watcher
    .on('error', (error) => console.error(`[@withkoji/vcc] Watcher error: ${error}`))
    .on('all', () => {
      if (watcherDebounce) {
        clearTimeout(watcherDebounce);
        watcherDebounce = null;
      }
      watcherDebounce = setTimeout(() => {
        console.log('[@withkoji/vcc] Rebuilding config...');
        writeConfig();
      }, 250);
    })
    .on('ready', () => {
      console.log(`[@withkoji/vcc] Watching ${kojiDir}...`);
    });
};

export default watch;
