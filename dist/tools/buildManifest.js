"use strict";

/**
 * buildManifest.js
 * 
 * What it does:
 *   This file takes the data that it finds in metadata.json and
 *   wraps it up into a json string of a PWA complient manifest
 *   file. This file should be included and used to serve
 *   a static manifest.json on the root of your project.
 * 
 * Things to Edit:
 *   If you would like any specific options for your PWA 
 *   manifest.json file like more icon sizes or a different
 *   theme color, you can add them to the manifest variable
 *   below.
 */
var fs = require('fs');

module.exports = function (metadata) {
  var manifest = {
    fingerprints: false,
    name: metadata.name || 'Made with Koji',
    short_name: metadata.short_name || 'Made with Koji',
    start_url: '.',
    display: 'standalone',
    description: metadata.description || 'Default description for this app.',
    background_color: metadata.background_color || "#FFFFFF",
    theme_color: metadata.theme_color || "#FFFFFF",
    icons: [{
      src: metadata.icon || 'https://images.koji-cdn.com/488e03ef-b60b-4ddb-a0ba-2eaa86948695/koji.png',
      sizes: '32x32'
    }, {
      src: metadata.icon192 || 'https://images.koji-cdn.com/488e03ef-b60b-4ddb-a0ba-2eaa86948695/koji192.png',
      sizes: '192x192',
      type: 'image/png'
    }, {
      src: metadata.icon512 || 'https://images.koji-cdn.com/488e03ef-b60b-4ddb-a0ba-2eaa86948695/koji512.png',
      sizes: '512x512',
      type: 'image/png'
    }]
  };
  return JSON.stringify(manifest, null, 2);
};