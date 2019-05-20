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

module.exports = (config) => {
    let routeConfig = {};
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (config.backend && config.routes && isBrowser) {
        const backendHost = window.location.host.replace('frontend', 'backend');
        routeConfig = config.routes.reduce((acc, { name, route, method, cache }) => {
            acc[name] = {
                url: config.backend[name],
                method,
                cache,
            };
            return acc;
        }, {});
    }
    return routeConfig;
}