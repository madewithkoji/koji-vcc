#!/usr/bin/env node
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

if (process.argv[2] === 'watch') {
  const watch = require('../dist/watch.js').default;
  watch();
}

if (process.argv[2] === 'postinstall') {
  try {
    const writeConfig = require('../dist/tools/writeConfig.js').default;
    writeConfig();
  } catch (err) {
    //
  }
}

if (process.argv[2] === 'postinstall-ts') {
  try {
    const writeConfig = require('../dist/tools/writeConfig.js').default;
    writeConfig(true);
  } catch (err) {
    //
  }
}

if (process.argv[2] === 'watch-ts') {
  const watch = require('../dist/watch.js').default;
  watch(true);
}
