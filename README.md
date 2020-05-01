## @withkoji/vcc

This package will

- ingest Koji VCC json files and create one big `config` object
- aid developers referencing VCC properties with tooltips stating their type and value (when using VSCode/Koji editor/etc)
- monitor those files and reload the project when they change
- map some `ENV` variables to make endpoints easily accessible

### Installation

`npm install --save @withkoji/vcc`

### Moving from `koji-tools`?

1. Remove koji-tools from your package.json
2. Run `npm remove koji-tools`
3. Install `npm install --save @withkoji/vcc`
4. Remove any `postbuild` script from your package.json
5. Update imports to be `import Koji from '@withkoji/vcc'`
6. Remove your existing `prestart` command
7. Implement the new watcher using the environment-specific instructions below

### Starting the watcher

#### Linux/OSX

To start the file watcher alongside your project, you need to add a `prestart` command to your `package.json` scripts:

```
{
  "scripts": {
    ...
    "prestart": "koji-vcc watch &"
  }
}
```

#### Windows

To start the file watcher alongside your project, you'll need to create a custom workflow to work locally (that won't interfere with your project inside the Koji editor/environment):

Install `npm-run-all`:

`npm i --save-dev npm-run-all`

Then modify your `package.json` scripts to add a custom command:
```
{
  "scripts: {
    ...
    "watch": "koji-vcc watch",
    "start-windows": "npm-run-all -p watch start"
  }
}
```

In your local Windows environment, you can now start the watcher using:

`npm run start-windows`

### Usage (Client)

`import Koji from '@withkoji/vcc'`

Import Koji to get access to the values that are set in your VCC and also to make calls to the backend. VCC values are available in `Koji.config`.

### What is a VCC?

VCCs are Visual Customization Controls. They allow you to use values in your application that are easily editable by other users who want to remix your application.

VCC files are JSON and live in the `.koji/customization` folder.

#### Sample VCC File

```
// .koji/customization/setttings.json

{
  "settings": {
    "name": "Hello World!"
  },
  "@@editor": [
    {
      "key": "settings",
      "name": "App settings",
      "icon": "⚙️",
      "source": "settings.json",
      "fields": [
          {
            "key": "name",
            "name": "App name",
            "type": "text"
          }
      ]
    }
  ],
}
```

In order to expose the VCC, nest your configuration under the `@@editor` key. This will generate a UI for the user to interact with the values.

`@@editor.name` and `@@editor.icon` dictate how the file will "appear" to the user. If you have multiple VCC files (settings, images, sounds), then using names and icons that match well with your VCC file scope will make them easier to find for another user.

`@@editor.source` should match the file name.

`@@editor.key` will be the top level key for accessing your configuration values.

`@@editor.fields` are the individual fields that are scoped to this configuration file. The `key` is the key for the value, the `name` is the display name, and the `type` is the input type.

The default values for your fields are mapped at the top level of the file, using a key that matches the `@@editor.key`.

#### Sample VCC Usage

In looking at the VCC file above, we could do the following:

```
import Koji from '@withkoji/vcc';

console.log(Koji.config.settings.name); // Hello World!
```

Hovering over the `name` property will display a tooltip showing **Type: string, Value: Hello World!**. This allows developers to reference what content will be displayed without having to switch back to the associated VCC file. Additionally, any strings that reference a web address (such as images, sounds, etc) can be clicked on to see the asset in a new browser tab.

#### Building TypeScript Projects with VCC

In order for your TypeScript projects to properly publish with Koji, you will need to add the following line to your `scripts` section of your project's `package.json`:

```
"prebuild": "koji-vcc preinstall-ts"
```

This causes your app to build the VCC config files prior to compiling your TypeScript code when publishing, just like when koji-vcc sets a watch on your config files during development. This is necessary to prevent errors by TypeScript during compile time.

### ENV Mapping

In order to make some `ENV` variables accessible to the frontend (browser), this package also supports some basic mapping so you can do things like `fetch` information from a backend service.

Services that are defined in your `develop.json` and `deploy.json` will be created and exposed in the project build step.

#### Sample develop.json

```
{
  "develop": {
    "frontend": {
      "path": "frontend",
      "port": 8080,
      "events": {
        "started": "[webpack] Frontend server started",
        "building": "[webpack] Frontend building",
        "built": "Compiled successfully.",
        "build-error": "[webpack] Frontend build error"
      },
      "startCommand": "npm start"
    },
    "backend": {
        "path": "backend",
        "port": 3333,
        "startCommand": "npm run start-dev",
        "events": {
            "started": "[koji] backend started",
            "log": "[koji-log]"
        }
    }
  }
}

```

The endpoints will be written to `ENV` variables in your project:

"frontend" > `KOJI_SERVICE_URL_FRONTEND`
"backend" > `KOJI_SERVICE_URL_BACKEND`

#### ENV Mapping Usage

You can easily access these service url variables in your application:

```
import Koji from '@withkoji/vcc';

const data = await fetch(`${Koji.config.serviceMap.backend}/getScores`);
```

### Hot reloading config changes

You can subscribe to an event that will notify you whenever a VCC value changes, so you can update your application while it's running, without requiring a full reload.

Note: This subscription may prevent HMR or other live reload from triggering.

```
import Koji from '@withkoji/vcc';

Koji.enableConfigDidChange();

Koji.configDidChange.subscribe(e => {
  console.log("Previous config:", e.previousValue);
  console.log("Current config:", e.newValue);
  console.log("Changes:", e.changes);
})
```

Three different values are included with the `configDidChange` event, so you can handle the change any way you like in your application.

#### Get the new config

You can get the new (changed) config object:

```
import Koji from '@withkoji/vcc';

Koji.configDidChange.subscribe(e => {
  const currentConfig = e.newValue;

  // update your application state...
})
```

#### Get a list of changes

Or, you can get a list of all of the changes, so you can respond to just the values that are different:

```
import Koji from '@withkoji/vcc';

Koji.configDidChange.subscribe(e => {
  // The configDidChange event includes an array of
  // individual changes that were made to the config object

  e.changes.forEach(change => {

    // Each change includes three properties
    const { path, newValue, previousValue } = change;

    // The path is an array of strings
    // that represents a location in the config object.
    //
    // For example, given a config object that looks like this:
    //
    // {
    //   "colors": {
    //     "fog": "#c9cac6",
    //     "sky": "#36639b",
    //     "horizon": "#95b1c9",
    //     "opponent": "#FFFF00",
    //     "player": "#0000FF",
    //     "ground": "#777777"
    //   }
    // }
    //
    // If the "sky" property in the colors object changes to "#0000FF",
    //
    // change.path will be:
    //
    //   ["colors", "sky"]
    //
    // change.previousValue will be:
    //
    //   "#36639b"
    //
    // and change.newValue will be:
    //
    //   "#0000FF"
  });
})
```

#### Compare the previous and new config manually

Or, you can compare the previous and new config objects yourself:

```
import Koji from '@withkoji/vcc';

Koji.configDidChange.subscribe(e => {
  const previousConfig = e.previousValue;
  const currentConfig = e.newValue;

  // compare the objects and update your application state...
})
```

#### Unsubscribe from the change event

The `subscribe` method returns an object that you can use to unsubscribe from the event.

To unsubscribe, call the object's `release()` method:

```
import Koji from '@withkoji/vcc';

const subscription = Koji.configDidChange.subscribe(e => {
  // ...
});

subscription.release();
```

### Instant Remixing (beta)

To support instant remixing, import and instantiate the`InstantRemix` class:
```
import { InstantRemixing } from '@withkoji/vcc';

const instantRemixing = new InstantRemixing();
```

Use the getter to pull initial values, automatically accounting for deployed injections:
```
const backgroundColor = instantRemixing.get(['colors', 'backgroundColor']);
```

Add a listener in your app to whether we're in a remixing state:
```
instantRemixing.onSetRemixing((isRemixing) => {
  //
});
```

Add a listener in your app to detect changes:
```
instantRemixing.onValueChanged((path, newValue) => {
  // inject the new value into your app
});
```

Add a listener in your app to get notifications when the current editor control has changed, so the app can, e.g., highlight the control or pause an interface
```
instantRemixing.onSetActivePath((path) => {
  //
});
```

Add a listener in your app to get notifications when the current state has changed. If an app has more than one state, available states are listed when remixing so the user can quickly preview various screens
```
instantRemixing.onSetCurrentState((state) => {
  //
});
```

States are optional, and defined in the `quickstart.json`:
```
{
   "quickstart": {
        "states": [
            { "key": "choice", "label": "Choice scene" },
            { "key": "result", "label": "Result scene" }
        ]
    }
}
```

Tell the class that your app is ready to start receiving events:
```
instantRemixing.ready();
```

Tell Koji to show a VCC when the user requests an edit (e.g., taps on an editable control):
```
instantRemixing.onPresentControl(['scope', 'key']);
```

Optionally, present a control with an element's position/size info, so Koji can attempt to keep the element in frame when it is being edited:
```
const {
  x,
  y,
  width,
  height,
} = e.target.getBoundingClientRect();
this.instantRemixing.onPresentControl(['result', 'position'], {
  position: { x, y, width, height },
});
```

If you have configured your app to support instant remixing and are ready to make
it available to users, add the `InstantRemixing` entitlement to your app by creating a 
file in your `.koji` directory called `entitlements.json` with the body:
```
{
  "entitlements": {
    "InstantRemixing": true
  }
}
```

#### Share images

When the app is shared to social networks, Koji automatically renders a share image based on an app screenshot. If you want to create a custom interface to screenshot, look for the query string paramter `koji-screenshot=1` in the URL. The screenshot size should be 1200x630.

### Feed SDK (beta)

See documentation in `src/FeedSdk/index.js` for right now. More info coming soon!
