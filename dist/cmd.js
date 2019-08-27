#!/usr/bin/env node
"use strict";

if (process.argv[2] === 'watch') {
  var watch = require('./watch.js');

  watch();
}

if (process.argv[2] === 'postinstall') {
  var refresh = require('./refresh.js');

  refresh();
}

if (process.argv[2] === 'pwa') {
  var pwa = require('./pwa.js');

  pwa();
}