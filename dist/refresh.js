"use strict";

var buildConfig = require('./tools/buildConfig.js');

module.exports = function () {
  var fs = require('fs'); // escape our cached configs so koji editor can't store them


  var config = JSON.stringify({
    config: JSON.parse(buildConfig())
  }, null, 2);
  console.log('c', config);

  try {
    console.log('f', "".concat(__dirname));
    fs.writeFileSync("".concat(__dirname, "/config.json"), config);
  } catch (err) {
    console.log(err);
  }

  console.log('new config!!');
};