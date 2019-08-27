"use strict";

/**
 * koji_utilities/routes.js
 * 
 * What it Does:
 *   This function takes all of the backend route data and makes it easier to
 *   deal with. For use with koji_utilities/request.js, pass a route from the
 *   array that this file outputs in order to make a request to a backend route
 * 
 * Things to Change:
 *   This is a pretty simple utility that doesn't require or allow much customization.
 *   If you want to pass additional data from the koji.json file in your routes to
 *   request.js you can set that up in this file.
 */
module.exports = function (config) {
  var routeConfig = {};
  var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (config.backend && config.routes && isBrowser) {
    var backendHost = window.location.host.replace('frontend', 'backend');
    routeConfig = config.routes.reduce(function (acc, _ref) {
      var name = _ref.name,
          route = _ref.route,
          method = _ref.method,
          cache = _ref.cache;
      acc[name] = {
        url: config.backend[name],
        method: method,
        cache: cache
      };
      return acc;
    }, {});
  }

  return routeConfig;
};