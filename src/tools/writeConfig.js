import fs from 'fs';
import readDirectory from './readDirectory';
import findRootDirectory from './findRootDirectory';

const writeConfig = () => {
  const projectConfig = {};
  const root = findRootDirectory();

  // Add config items from koji json files
  readDirectory(root)
    .filter((path) => (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources'))
    .forEach((path) => {
      try {
        const file = JSON.parse(fs.readFileSync(path, 'utf8'));

        Object.keys(file).forEach((key) => {
          // If the key already exists in the project config, use it
         let configValue = projectConfig[key];
         const fileValue = file[key];
          if (configValue) {
            
            Array.isArray(configValue) && Array.isArray(fileValue))
            ? (configValue = configValue.concat(fileValue))
            : (configValue = Object.assign(configValue, fileValue));
          } 
          // Otherwise, set it
          configValue = fileValue;
          
          //Finally, set the projectConfig key's value
          projectConfig = {...projectConfig, projectConfig[key]: configValue}
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

  // Write the generated config to a json file
  try {
    fs.writeFileSync(
      `${__dirname}/../res/config.json`,
      JSON.stringify(projectConfig, null, 2),
    );
  } catch (err) {
    //
  }
};

export default writeConfig;
