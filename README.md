# Koji VCC
![npm (scoped)](https://img.shields.io/npm/v/@withkoji/vcc?color=green&style=flat-square)

**Core library for developing remixable Koji templates.**

## Overview

**[DEPRECATED]**
This package is deprecated and is included only for backwards compatibility. For new templates, use [@withkoji/core](https://developer.withkoji.com/reference/packages/withkoji-koji-core).

The @withkoji/vcc package enables you to implement core platform features in your Koji template, including instant remixing, Visual Customization Controls (VCCs), and the Koji feed.

## Installation

Install the package in your Koji project.

```
npm install --save @withkoji/vcc
```

## Basic use

### Start the watcher

Reconfigure the `package.json` file to run the watcher (`koji-vcc watch`) concurrently with your development  server.
You can install and use a package like npm-run-all.
For example:

```
{
  "scripts": {
    ...
    "start": "npm-run-all -p watch start:server",
    "watch": "koji-vcc watch",
    "start:server": "webpack-dev-server --config ./.internals/webpack.development.js --inline --hot"
  }
}
```

**NOTE:** Make sure to replace the value of `"start:server"` with the `"start"` command for your project and remove the `prestart` command, if there is one.

### Support TypeScript

To ensure that VCCs work correctly in your TypeScript project, add the following line to the `scripts` section of the `package.json` file.

```
"prebuild": "koji-vcc preinstall-ts"
```

### InstantRemixing

Instant remixing enables users to customize values directly from the template preview, rather than from the Koji editor, for a quick and easy way to remix without coding.

To enable instant remixing for your Koji template, you must implement the `InstantRemixing` class and enable the `InstantRemixing` entitlement in the `.koji/project/entitlements.json` file.

```
{
  "entitlements": {
    "InstantRemixing": true
  }
}
```

Instantiate `InstantRemixing`.

```
import { InstantRemixing } from '@withkoji/vcc';
const instantRemixing = new InstantRemixing();
```

### VccMiddleware

This package includes an [Express middleware](http://expressjs.com/en/guide/using-middleware.html) to manage the environment variables for instant remixes and for access to VCC values from dynamic backends, as a companion to the frontend `InstantRemixing` class.

To implement this middleware, add it to your Express server.

```
import { VccMiddleware } from '@withkoji/vcc';

const app = express();
app.use(VccMiddleware.express);
```

This middleware is required to manage the environment variables to scope them for instant remixes of the original template.
In particular, you must call this middleware before instantiating certain packages, including [@withkoji/koji-iap](https://developer.withkoji.com/reference/packages/withkoji-koji-iap-package), [@withkoji/database](https://developer.withkoji.com/reference/packages/withkoji-database-package), and [@withkoji/koji-auth-sdk](https://developer.withkoji.com/reference/packages/withkoji-koji-auth-sdk).

### FeedSdk

The Koji feed enables users to browse available templates, moving them from off screen or out of focus, into the main window of the feed.

To ensure a template can be displayed correctly in the Koji feed, you must implement the `FeedSdk` and enable the `FeedEvents` entitlement in the `.koji/project/entitlements.json` file.

```
{
  "entitlements": {
    "FeedEvents": true
  }
}
```

**NOTE:** Kojis must be authorized by the Koji team to be displayed within the feed.
When you are confident that your template is able to function well within a feed, please contact us for review and authorization.

Instantiate `FeedSdk`.

```
import { FeedSdk } from '@withkoji/vcc';
const feed = new FeedSdk();
```

### Keystore

The `Keystore` module is used in conjunction with the secret VCC type to store sensitive data, ensuring the value is not visible when the project is remixed.

Instantiate `Keystore`.

```
import { Keystore } from '@withkoji/vcc';
const keystore = new Keystore();
```

## Related resources

- [Package documentation](https://developer.withkoji.com/reference/packages/withkoji-vcc-package)
- [What is remixing?](https://developer.withkoji.com/docs/getting-started/instant-remixing)
- [Developing your first Koji template](https://developer.withkoji.com/docs/getting-started/start-guide-1)
- [Koji homepage](http://withkoji.com/)

## Contributions and questions

See the [contributions page](https://developer.withkoji.com/docs/about/contribute-koji-developers) on the developer site for info on how to make contributions to Koji repositories and developer documentation.

For any questions, reach out to the developer community or the `@Koji Team` on our [Discord server](https://discord.com/invite/9egkTWf4ec).
