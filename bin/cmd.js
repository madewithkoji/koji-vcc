#!/usr/bin/env node
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

if (process.argv[2] === 'watch') {
  const watch = require('../dist/watch.js').default;
  watch();
}
