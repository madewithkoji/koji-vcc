/* eslint-disable no-param-reassign */
import fs from 'fs';
import readDirectory from './readDirectory';
import findRootDirectory from './findRootDirectory';

const writeConfig = () => {
  const root = findRootDirectory();
  // Add config items from koji json files
  const projectConfig = readDirectory(root)
    .reduce((config, path) => {
      try {
        if (!(path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources')) return config;
        const file = JSON.parse(fs.readFileSync(path, 'utf8'));
        Object.keys(file).forEach((key) => {
          // If the key already exists in the project config, use it
          let configValue = config[key];
          const fileValue = file[key];
          if (configValue) {
            configValue = (Array.isArray(configValue) && Array.isArray(fileValue))
              ? configValue.concat(fileValue)
              : Object.assign(configValue, fileValue);
          } else {
            // Otherwise, set it
            configValue = fileValue;
          }

          // Finally, set the config key's value
          config[key] = configValue;
        });
      } catch (e) {
      //
      }
      return config;
    }, {});

  // Expose the serviceMap based on environment variables
  projectConfig.serviceMap = Object.keys(process.env).reduce((serviceMap, envVariable) => {
    if (envVariable.startsWith('KOJI_SERVICE_URL')) {
      serviceMap[envVariable.replace('KOJI_SERVICE_URL_', '').toLowerCase()] = process.env[envVariable];
    }
    return serviceMap;
  }, {});

  // Write the generated config to a json file
  try {
    fs.writeFileSync(
      `${__dirname}/../res/config.json`,
      JSON.stringify(projectConfig, null, 2),
    );
  } catch (err) {
    const error = new Error(`[@withkoji/vcc] ${err.message}`);
    error.stack = err.stack;
    throw err;
  }
};

export default writeConfig;
