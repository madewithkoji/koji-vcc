/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
export default class FeedSdk {
  constructor() {
    // Ugly globals attached to the window right now to avoid having to worry
    // about singletons/initialization state if this class is instantiated
    // multiple times at different timestamps in the app
    window._KOJI_FEED_SDK_IS_PLAYING = !window.location.hash.includes('#koji-feed-key=');
    window._KOJI_FEED_SDK_IS_BUBBLING_CURRENT_TOUCH = true;
    window._KOJI_FEED_SDK_PASSTHROUGH_ORIGIN_MAP = {};

    this._playbackListeners = [];
    this._registerListeners();
  }

  // Public getter for playback state
  get isPlaying() {
    return window._KOJI_FEED_SDK_IS_PLAYING;
  }

  // Call when the app has loaded and is ready to be shown in the feed. The feed
  // will display a loading state until the app has called this method, and
  // will eventually time out and move to the next app in the feed.
  load() {
    if (window._KOJI_FEED_SDK_HAS_LOADED) {
      return;
    }
    window._KOJI_FEED_SDK_HAS_LOADED = true;

    this._postMessage('Koji.Loaded');

    // Bind gestures
    window.addEventListener('touchstart', (e) => {
      window._KOJI_FEED_SDK_IS_BUBBLING_CURRENT_TOUCH = true;
      const {
        screenX,
        screenY,
      } = e.changedTouches[0];
      this._postMessage('Koji.TouchStart', {
        screenX,
        screenY,
      });
    });

    window.addEventListener('touchmove', (e) => {
      if (!window._KOJI_FEED_SDK_IS_BUBBLING_CURRENT_TOUCH) {
        return;
      }

      const {
        screenX,
        screenY,
      } = e.changedTouches[0];
      this._postMessage('Koji.TouchMove', {
        screenX,
        screenY,
      });
    });

    window.addEventListener('touchend', (e) => {
      if (!window._KOJI_FEED_SDK_IS_BUBBLING_CURRENT_TOUCH) {
        return;
      }

      const {
        screenX,
        screenY,
      } = e.changedTouches[0];
      this._postMessage('Koji.TouchEnd', {
        screenX,
        screenY,
      });
    });
  }

  // The `load` method below takes care of automatically bubbling touch events
  // to the Koji feed controller (because a feed is composed of iframes, the
  // parent feed controlled can't capture touch events inside the frame due to
  // security policies). If a user is touching an area in your app that should
  // not trigger an "advance" gesture in the feed controller, simply invoke
  // this method at any point after the touch has started to cancel the gesture.
  // e.g., `<div ontouchmove={(e) => feed.requestCancelTouch()}>no touching</div>`
  requestCancelTouch() {
    console.log('Canceled touch');
    window._KOJI_FEED_SDK_IS_BUBBLING_CURRENT_TOUCH = false;
    this._postMessage('Koji.CancelTouch');
  }

  // In a feed view, apps are preloaded when they near the viewport. For most
  // apps, this isn't an issue. However, if an app plays audio/video or has a
  // "start" state, like a timer/countdown, Koji will let the app know when it
  // should start or stop playback. `callback` is a function with a single
  // boolean argument `.onPlaybackStateChanged((isPlaying: bool) => {})`
  onPlaybackStateChanged(callback) {
    this._playbackListeners.push(callback);
  }

  // Navigation methods allow the Koji to load other content without triggering
  // a browser navigation event (which can be clunky in embedded contexts).
  // These methods are intended to load other Kojis, but they will also handle
  // ordinary URLs. Many sites do not allow themselves to be framed (via the
  // `x-frame-options` header), so if you try to use one of the navigation
  // methods to load a URL and the URL can not be framed, the user will be
  // prompted to navigate at the browser level.

  // Navigate replaces the currently loaded Koji with the content of `url`
  navigate(url) {
    this._postMessage('Koji.Navigate', {
      url,
    });
  }

  // Present presents the currently loaded Koji in a sheet that animates from
  // the bottom of the screen. If the parent Koji is already presented in a
  // modal, presenting a new Koji will navigate within the sheet instead of
  // presenting another sheet.
  present(url) {
    this._postMessage('Koji.Navigate', {
      url,
      presentationType: 'modal',
    });
  }

  // (private) Send a message to the parent, if one exists. Include a "feed token"
  // that we grab from the hash so we can identify messages originating
  // from this specific app in case it, for whatever reason, appears multiple
  // times in the same feed.
  _postMessage(type, message = {}) {
    const feedKey = window.location.hash
      .replace('#koji-feed-key=', '');

    if (window.parent) {
      window.parent.postMessage({
        _type: type,
        _feedKey: feedKey,
        ...message,
      }, '*');
    }
  }

  // (private) Register event listeners
  _registerListeners() {
    window.addEventListener('message', ({ data, origin, source }) => {
      // Handle state changes
      if (data.event === 'KojiFeed.Play') {
        try {
          window._KOJI_FEED_SDK_IS_PLAYING = true;
          this._playbackListeners.forEach((callback) => {
            callback(true);
          });
        } catch (err) {
          console.log(err);
        }
      }
      if (data.event === 'KojiFeed.Pause') {
        try {
          window._KOJI_FEED_SDK_IS_PLAYING = false;
          this._playbackListeners.forEach((callback) => {
            callback(false);
          });
        } catch (err) {
          console.log(err);
        }
      }

      // Handle passthrough of messages from any Kojis inside this Koji
      if (data._type === 'Koji.ContextPassthrough.Up') {
        try {
          window._KOJI_FEED_SDK_PASSTHROUGH_ORIGIN_MAP[origin] = source;
          // Mutate the source map to add the context
          if (window.parent) {
            window.parent.postMessage({
              ...data,
              _path: (data._path || []).push(origin),
            }, '*');
          }
        } catch (err) {
          //
        }
      }
      if (data._type === 'Koji.ContextPassthrough.Down') {
        try {
          const destinationOrigin = data._path[0];
          if (window._KOJI_FEED_SDK_PASSTHROUGH_ORIGIN_MAP[destinationOrigin]) {
            window._KOJI_FEED_SDK_PASSTHROUGH_ORIGIN_MAP[destinationOrigin].postMessage({
              ...data,
              _path: data._path.slice(1),
            }, '*');
          }
        } catch (err) {
          //
        }
      }
    });
  }
}
