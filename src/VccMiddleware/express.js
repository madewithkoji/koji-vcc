import deepmerge from 'deepmerge';

const config = require('../res/config.json');

export default function vcc(req, res, next) {
  let headerOverrides = {};
  try {
    headerOverrides = JSON.parse(req.headers['x-trusted-koji-overrides'] || {});
  } catch (err) {
    //
  }
  const resolvedConfig = deepmerge(
    config,
    headerOverrides,
    { arrayMerge: (dest, source) => source },
  );
  res.locals.koji = resolvedConfig;

  // Set env vars
  if (typeof window === 'undefined') {
    process.env.KOJI_PROJECT_ID = req.headers['x-trusted-koji-project-id'] || process.env.KOJI_PROJECT_ID;
    process.env.KOJI_PROJECT_TOKEN = req.headers['x-trusted-koji-project-token'] || process.env.KOJI_PROJECT_TOKEN;
  }

  next();
}
