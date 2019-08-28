import fs from 'fs';
import buildConfig from './tools/buildConfig';

const refresh = () => {
  // escape our cached configs so koji editor can't store them
  const config = JSON.stringify({ config: JSON.parse(buildConfig()) }, null, 2);
  try {
    fs.writeFileSync(`${__dirname}/config.json`, config);
  } catch (err) {
    console.log(err);
  }
};

export default refresh;
