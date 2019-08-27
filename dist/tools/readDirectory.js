"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('child_process'),
    execSync = _require.execSync;

var _require2 = require('ansi-colors-and-styles'),
    _YLW = _require2._YLW,
    RED = _require2.RED,
    RST = _require2.RST;

var path = require('path'); // Get all git-indexed paths to find koji files


module.exports = function (directory) {
  return readDirectoryRelative(directory).map( // Make path absolute:
  function (relativePath) {
    return path.resolve(directory, relativePath);
  });
};

function readDirectoryRelative(directory) {
  try {
    var list = execSync('git ls-files', {
      cwd: directory
    }).toString().replace(/\n$/, '').split('\n'); // Find the paths of git submodules (not recursive):

    var submodulesInfo = execSync('git submodule status', {
      cwd: directory
    }).toString();
    var regExp = /^ [A-Fa-f0-9]{40,64} (.+?) \(.+?\)$/gm; // live: https://regex101.com/r/yUEJNe/2/

    var _loop = function _loop() {
      var _list;

      var match = regExp.exec(submodulesInfo);
      if (match === null) return "break"; //const submoduleInfo = match[0]

      var submodulePath = match[1]; // Sample values for above variables:
      //     submoduleInfo: " debd72fe632d7315be8e31fe00c7e767c423a01f sub-repo1 (heads/master)"
      //     submodulePath: "sub-repo1"
      // Exclude submodule directory from the list:

      list = list.filter(function (path) {
        return path !== submodulePath;
      }); // Instead, add paths under the submodule (recursive):

      (_list = list).push.apply(_list, _toConsumableArray(readDirectoryRelative(path.resolve(directory, submodulePath)).map( // Make path relative to `directory`:
      function (nestedPath) {
        return path.join(submodulePath, nestedPath);
      })));
    };

    while (true) {
      var _ret = _loop();

      if (_ret === "break") break;
    }

    return list;
  } catch (err) {
    var error = new Error(err.message + "\n".concat(_YLW).concat(RED, "Have you installed \"git\" and added it to the \"PATH\"? If no see: ") + "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git".concat(RST, "\n"));
    error.stack = err.stack;
    throw error;
  }
}