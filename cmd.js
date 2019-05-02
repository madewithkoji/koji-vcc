#!/usr/bin/env node

if (process.argv[2] === 'watch') {
    var watch = require('./watch.js');
    watch();
}

if (process.argv[2] === 'postinstall') {
    var refresh = require('./refresh.js');
    refresh();
}
