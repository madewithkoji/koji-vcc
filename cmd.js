#!/usr/bin/env node

if (process.argv[2] === 'setup') {
    var setup = require('./setup.js');
    setup();
}
