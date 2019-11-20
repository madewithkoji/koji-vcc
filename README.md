## @withkoji/vcc

This package will

- ingest Koji VCC json files and create one big `config` object
- monitor those files and reload the project when they change
- map some `ENV` variables to make endpoints easily accessible

### Moving from `koji-tools`?

1. Remove koji-tools from your package.json
2. Run `npm remove koji-tools`
3. Install `npm install --save @withkoji/vcc`
4. Remove any `postbuild` script from your package.json
5. Change your `prestart` comment to `koji-vcc watch &`
6. Update imports to be `import Koji from '@withkoji/vcc'`

### Installation

`npm install --save @withkoji/vcc`

### Starting the watcher

To start the file watcher alongside your project, you need to add a `prestart` command to your `package.json` scripts:

```
{
  "scripts": {
    ...
    "prestart": "koji-vcc watch &"
  }
}
```

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
    },

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

```
import Koji from '@withkoji/vcc';

Koji.configDidChange.subscribe(e => {
  console.log("Previous config": e.previousValue);
  console.log("Current config": e.newValue);
  console.log("Changes": e.changes);
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
