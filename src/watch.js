import chokidar from 'chokidar';
import readDirectory from './tools/readDirectory';
import refresh from './refresh';
import findRootDirectory from './tools/findRootDirectory';

const watch = () => {
  // const props = JSON.parse(refresh());
  // output what the server wants us to in order to start the preview window
  // console.log(props.config.develop.frontend.events.built);
  // NOTE: figure out what to do about this one, because we cant output this before
  // the server is ready...

  // make sure that its in there to start, postinstall has been doing so weird stuff
  refresh();
  // watch the .koji directory from a node_modules directory...
  const files = readDirectory(findRootDirectory()).filter((path) => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'));

  const watcher = chokidar.watch(files, {

  });

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
