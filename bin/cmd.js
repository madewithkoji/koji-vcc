#!/usr/bin/env node
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

if (process.argv[2] === 'watch') {
  const watch = require('../dist/watch.js').default;
  watch();
}

if (process.argv[2] === 'postinstall') {
  const writeConfig = require('../dist/tools/writeConfig.js').default;
  writeConfig();
}
