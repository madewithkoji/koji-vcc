import deepmerge from 'deepmerge';

const config = require('../res/config.json');

// Overrides coming from the headers are URL-encoded, so we need to decode them
// before using them
const decodeObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      decodeObject(obj[key]);
      return;
    }
    obj[key] = decodeURI(obj[key]);
  });
}

export default function vcc(req, res, next) {
  let headerOverrides = {};
  try {
    headerOverrides = JSON.parse(req.headers['x-trusted-koji-overrides'] || {});
    decodeObject(headerOverrides);
  } catch (err) {
    //
  }

  const resolvedConfig = deepmerge(
    config,
    headerOverrides,
    { arrayMerge: (dest, source) => source },
  );
  res.locals.koji = resolvedConfig;
  res.locals.KOJI_PROJECT_ID = req.headers['x-trusted-koji-project-id'] || process.env.KOJI_PROJECT_ID;
  res.locals.KOJI_PROJECT_TOKEN = req.headers['x-trusted-koji-project-token'] || process.env.KOJI_PROJECT_TOKEN;

  // Set env vars
  process.env.KOJI_PROJECT_ID = req.headers['x-trusted-koji-project-id'] || process.env.KOJI_PROJECT_ID;
  process.env.KOJI_PROJECT_TOKEN = req.headers['x-trusted-koji-project-token'] || process.env.KOJI_PROJECT_TOKEN;

  next();
}
