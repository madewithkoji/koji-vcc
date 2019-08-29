import chokidar from 'chokidar';
import readDirectory from './tools/readDirectory';
import refresh from './refresh';
import findRootDirectory from './tools/findRootDirectory';

const watch = () => {
  // Call once before postinstall?
  refresh();

  // Watch the .koji directory from a node_modules directory
  const files = readDirectory(findRootDirectory()).filter((path) => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'));

  // Note: Polling is used by default in the container via
  // the CHOKIDAR_USEPOLLING=1 env that is set in the container
  const watcher = chokidar.watch(files);

  watcher
    .on('error', (error) => console.error(`Watcher error: ${error}`))
    .on('change', () => {
      refresh();
    })
    .on('ready', () => {
      const watched = watcher.getWatched();
      Object.keys(watched).map((path) => watched[path].map((file) => console.log(`Watching: ${path}/${file}`)));
    });
};

export default watch;
