import fs from 'fs';
import readDirectory from './readDirectory';
import findRootDirectory from './findRootDirectory';

const buildConfig = () => {
  const projectConfig = {};
  const root = findRootDirectory();

  readDirectory(root)
    .filter((path) => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'))
    .forEach((path) => {
      try {
        const file = JSON.parse(fs.readFileSync(path, 'utf8'));

        Object.keys(file).forEach((key) => {
          // If the key already exists in the project config, use it
          if (projectConfig[key]) {
            if (Array.isArray(projectConfig[key]) && Array.isArray(file[key])) {
              projectConfig[key] = projectConfig[key].concat(file[key]);
            } else {
              projectConfig[key] = Object.assign(projectConfig[key], file[key]);
            }
          } else {
            // Otherwise, set it
            projectConfig[key] = file[key];
          }
        });
      } catch (err) {
        //
      }
    });

  // Expose the serviceMap based on environment variables
  projectConfig.serviceMap = Object.keys(process.env).reduce((acc, cur) => {
    if (cur.startsWith('KOJI_SERVICE_URL')) {
      acc[cur.replace('KOJI_SERVICE_URL_', '').toLowerCase()] = process.env[cur];
    }
    return acc;
  }, {});

  return JSON.stringify(projectConfig);
};

export default buildConfig;
