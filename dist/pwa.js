"use strict";

// this file is a server side tool
// that will do the following:
// 1: set a flag for static rendering to use PWA stuff 
// 2: inject in a generated manifest.json --check
// 3: inject reference to manifest.json in index.html --check
// 4: get a list of all relevent files in the *dist* directory. --check
// 5: inject a service worker with all those files.-- check
var fs = require('fs');

var crypto = require('crypto');

module.exports = function () {
  var config = require('./config.json').config; // tell frontend that we're using a pwa setup now...


  var newConfig = JSON.stringify({
    config: config,
    pwa: true
  }, null, 2);
  fs.writeFileSync("".concat(__dirname, "/config.json"), newConfig);
  var dist_dir = "".concat(require('./tools/findRootDirectory.js')(), "/").concat(config.deploy.frontend.output); // we need to reference the manifest we're putting in...

  var index = fs.readFileSync("".concat(dist_dir, "/index.html")).toString();
  var newIndex = index.replace('<head>', '<head><link rel="manifest" href="./manifest.webmanifest"/>');
  fs.writeFileSync("".concat(dist_dir, "/index.html"), newIndex);
  var metadata = config.metadata || {};

  var manifest = require('./tools/buildManifest.js')(metadata);

  var dist_files = fs.readdirSync(dist_dir);
  var precache = [];
  var all_shas = '';
  dist_files.forEach(function (file) {
    var sha = crypto.createHash('sha256').update(fs.readFileSync("".concat(dist_dir, "/").concat(file))).digest('hex');
    precache.push({
      url: "/".concat(file),
      revision: sha
    });
    all_shas += sha;
  });
  var manifest_id = crypto.createHash('sha256').update(all_shas).digest('hex');
  var precache_file = "self.__precacheManifest = (self.__precacheManifest || []).concat(".concat(JSON.stringify(precache, null, 2), ");");
  var sw_file = fs.readFileSync("".concat(__dirname, "/tools/service-worker.js")).toString();
  var sw_file_injected = sw_file.replace('[inject_id]', manifest_id);
  fs.writeFileSync("".concat(dist_dir, "/precache-manifest-").concat(manifest_id, ".js"), precache_file);
  fs.writeFileSync("".concat(dist_dir, "/service-worker.js"), sw_file_injected);
  fs.writeFileSync("".concat(dist_dir, "/manifest.webmanifest"), manifest);
};