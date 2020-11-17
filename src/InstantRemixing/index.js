/* eslint-disable class-methods-use-this */
import deepmerge from 'deepmerge';
import objectPath from 'object-path';

const config = require('../res/config.json');

export default class InstantRemixing {
  constructor() {
    this.listeners = [];

    // Use a global here to force a singleton-ish state across multiple
    // instantiations
    window.KOJI_VCC_RESOLVED_CONFIG = window.KOJI_VCC_RESOLVED_CONFIG || config;

    // Instant remixes inject VCC mutations into published apps using the
    // `window.KOJI_OVERRIDES` variable. If that variable is present when this
    // class is instantiated, merge the values present in that object with
    // the config file that is present on disk.
    if (window.KOJI_OVERRIDES && window.KOJI_OVERRIDES.overrides) {
      window.KOJI_VCC_RESOLVED_CONFIG = deepmerge(
        window.KOJI_VCC_RESOLVED_CONFIG,
        window.KOJI_OVERRIDES.overrides,
        { arrayMerge: (dest, source) => source },
      );
    }

    this.isRemixing = false;
    this.editorAttributes = {};
    this.remixListeners = [];

    this.activePath = null;
    this.activePathListeners = [];

    this.currentState = null;
    this.currentStateListeners = [];

    this.registerListeners();
  }

  // Get a value from the resolved Koji config, including any overrides from the
  // global space, or processed changes from our event listeners. `path` is an
  // array of keys pointing to the desired value
  get(path) {
    let pointer = window.KOJI_VCC_RESOLVED_CONFIG;
    for (let i = 0; i < path.length; i += 1) {
      pointer = pointer[path[i]];
    }
    return pointer;
  }

  // Add a listener that is triggered when we receive changes to VCC files
  // from window events. `callback` is a function like (path, newValue) => {},
  // where path is an array of keys pointing to the changed value.
  onValueChanged(callback) {
    this.listeners.push(callback);
  }

  // Handler to receive events when we figure out if we're being remixed or not,
  // to allow the app to present itself differently when being remixed
  onSetRemixing(callback) {
    this.remixListeners.push(callback);
  }

  // Handler to receive events when the current VCC changes
  onSetActivePath(callback) {
    this.activePathListeners.push(callback);
  }

  // Handler to receive events when the user changes the app's state
  onSetCurrentState(callback) {
    this.currentStateListeners.push(callback);
  }

  // Ask the Koji editor to present a control at a keypath
  onPresentControl(path, attributes = {}) {
    if (window.parent) {
      window.parent.postMessage({
        _type: 'KojiPreview.PresentControl',
        path,
        attributes,
      }, '*');
    }
  }

  // Explicitly set a value for a VCC at a path
  onSetValue(path, newValue, skipUpdate = false) {
    // Save in our resolved config for future getters
    objectPath.set(window.KOJI_VCC_RESOLVED_CONFIG, path.join('.'), newValue);

    // Push up to the parent
    if (window.parent) {
      window.parent.postMessage({
        _type: 'KojiPreview.SetValue',
        path,
        newValue,
        skipUpdate,
      }, '*');
    }
  }

  /**
   * Create a new remix
   options: {
     resetValues: boolean = false,
   }
  */
  onCreateRemix(options = {}) {
    if (window.parent) {
      window.parent.postMessage({
        _type: 'KojiPreview.CreateRemix',
        options,
      }, '*');
    }
  }

  // Required to notify parent containers that the window is ready to receive
  // events over the wire. Parent is responsible for queueing events and
  // redispatching them if the app is not ready to receive them.
  ready() {
    if (window.parent) {
      window.parent.postMessage({
        _type: 'KojiPreview.Ready',
      }, '*');
    }
  }

  // (private) Register event listeners for changes
  registerListeners() {
    // Coming in from an iframe (instant remix)
    window.addEventListener('message', ({ data }) => {
      const { event } = data;

      // Handle initialization event
      if (event === 'KojiPreview.IsRemixing') {
        const { isRemixing, editorAttributes } = data;
        try {
          this.isRemixing = isRemixing;
          this.editorAttributes = editorAttributes || {};
          this.remixListeners.forEach((callback) => {
            callback(isRemixing, editorAttributes || {});
          });
        } catch (err) {
          console.log(err);
        }
      }

      // Handle value change events
      if (event === 'KojiPreview.DidChangeVcc') {
        try {
          const {
            path,
            newValue,
          } = data;
          this.emitChange(path, newValue);
        } catch (err) {
          console.log(err);
        }
      }

      // Handle active path changes
      if (event === 'KojiPreview.DidSetActivePath') {
        try {
          const {
            path,
          } = data;
          this.activePath = path;
          this.activePathListeners.forEach((callback) => {
            callback(path);
          });
        } catch (err) {
          console.log(err);
        }
      }

      // Handle current state changes
      if (event === 'KojiPreview.DidSetCurrentState') {
        try {
          const {
            state,
          } = data;
          this.currentState = state;
          this.currentStateListeners.forEach((callback) => {
            callback(state);
          });
        } catch (err) {
          console.log(err);
        }
      }
    });

    // Coming in from a websocket (live preview)
    window.addEventListener('KojiPreview.DidChangeVcc', (e) => {
      try {
        const {
          path,
          newValue,
        } = e.detail;
        this.emitChange(path, newValue);
      } catch (err) {
        console.log(err);
      }
    });

    // Pass up click events so we can display context menus
    window.addEventListener('click', (e) => {
      try {
        const { clientX, clientY } = e;
        if (window.parent) {
          window.parent.postMessage({
            _type: 'KojiPreview.ClickEvent',
            x: clientX,
            y: clientY,
          }, '*');
        }
      } catch (err) {
        //
      }
    }, { capture: true, passive: true });
  }

  // (private) Update our local version of the config, and dispatch change
  // events to any callbacks we have registered
  emitChange(path, newValue) {
    objectPath.set(window.KOJI_VCC_RESOLVED_CONFIG, path.join('.'), newValue);
    this.listeners.forEach((callback) => {
      callback(path, newValue);
    });
  }
}
