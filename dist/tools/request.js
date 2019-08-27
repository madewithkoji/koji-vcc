"use strict";

/**
 * koji_utilities/request.js
 * 
 * What it Does:
 *   This file provides a simplified way to send requests to the backend server. This is
 *   accomplished by wrapping a few more configuration options into the fetch function.
 *   Requests can be made to backend without this file but it is much easier with it.
 * 
 * What to Change:
 *   In Request we provide a very basic version of authorization and pushing a user to
 *   a /login page if they are not logged in. This authorization feature can be changed
 *   around or expanded if its needed. Also if you have any preference for what parameters
 *   should be used in fetch, you can define them here.
 */
// Parse JSON returned by a request
function parseJSON(response) {
  return response.json();
} // Check the status of an HTTP request


function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  return response.json().then(function (_ref) {
    var error = _ref.error;
    throw new Error(error || 'api_error');
  });
}

function wrapFetch(route, params) {
  var computedRoute = route.url;
  var cacheOptions = route.cache || 'no-cache';
  var computedOptions = {
    method: route.method.toLowerCase(),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    cache: cacheOptions
  }; // Replace all named parameters in the URL

  var mutableParams = params || {};
  Object.keys(mutableParams).forEach(function (key) {
    if (computedRoute.indexOf(":".concat(key)) !== -1) {
      computedRoute = computedRoute.replace(":".concat(key), encodeURIComponent(mutableParams[key]));
      delete mutableParams[key];
    }
  }); // If it's a GET request, append all other params in the query string.
  // Otherwise, attach a JSON body to the POST request.

  if (route.method.toLowerCase() === 'get') {
    var queryParams = [];
    Object.keys(mutableParams).forEach(function (key) {
      return queryParams.push("".concat(key, "=").concat(encodeURIComponent(mutableParams[key])));
    });

    if (queryParams.length > 0) {
      computedRoute += "?".concat(queryParams.join('&'));
    }
  } else {
    computedOptions.body = JSON.stringify(mutableParams.body);
  } // Process the request


  return fetch(computedRoute, computedOptions);
} // Process an HTTP request


module.exports = function (route, params) {
  return wrapFetch(route, params).then(checkStatus).then(parseJSON)["catch"](function (err) {
    throw err;
  });
};