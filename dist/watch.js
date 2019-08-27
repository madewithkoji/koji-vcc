"use strict";

var buildConfig = require('./tools/buildConfig.js');

var readDirectory = require('./tools/readDirectory.js');

var refresh = require('./refresh.js');

var findRootDirectory = require('./tools/findRootDirectory.js');

module.exports = function () {
  var fs = require('fs');

  console.log('koji-tools watching'); // const props = JSON.parse(refresh());
  // output what the server wants us to in order to start the preview window
  // console.log(props.config.develop.frontend.events.built);
  // NOTE: figure out what to do about this one, because we cant output this before the server is ready...
  // make sure that its in there to start, postinstall has been doing so weird stuff

  refresh(); // watch the .koji directory from a node_modules directory...

  var root = findRootDirectory();
  readDirectory(root).filter(function (path) {
    return (path.endsWith('koji.json') || path.includes('.koji')) && !path.includes('.koji-resources');
  }).forEach(function (path) {
    console.log('Watching', path);
    var fsWait = false;
    fs.access(path, fs.F_OK, function (err) {
      if (!err) {
        fs.watch(path, function (eventType, filename) {
          if (fsWait) return;
          fsWait = setTimeout(function () {
            fsWait = false;
          }, 1000);
          console.log(eventType, filename);
          refresh();
        });
      }
    });
  });
};