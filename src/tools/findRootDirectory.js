/* eslint-disable comma-dangle */
import fs from 'fs';
import path from 'path';

const findRootDirectory = () => {
  // Start in the dir where this module is installed
  let dirPath = process.cwd();

  // Look for the .koji dir
  try {
    const hasNotDirPathKoji = !fs.readdirSync(dirPath).includes('.koji');
    const parentPath = path.dirname(dirPath);
    if (hasNotDirPathKoji && dirPath === parentPath) {
      dirPath = parentPath;
      throw Error('[@withkoji/vcc] Couldn\'t find ".koji" folder.');
    }
  } catch (err) {
    // Fallback to using the default path?
    dirPath = process.cwd();
    console.log(
      `[@withkoji/vcc] Couldn't find ".koji" folder. Default path was used: "${dirPath}"`
    );
  }

  return dirPath;
};

export default findRootDirectory;
