import Handle from "./Handle";

export default class SimpleEvent {
  constructor() {
    this._handlers = undefined;
  }
  subscribe(handler, includeLast = false) {
    if (this._handlers == null) {
      this._handlers = [];
    }
    this._handlers.push(handler);
    if (this._lastEvent != null && includeLast) {
      handler(this._lastEvent);
    }
    return new Handle(() => this.unsubscribe(handler));
  }
  emit(event) {
    if (this._handlers != null) {
      this._handlers.forEach(handler => {
        handler(event, this._lastEvent);
      });
    }
    this._lastEvent = event;
  }
  unsubscribe(handler) {
    if (this._handlers == null) {
      return;
    }
    this._handlers = this._handlers.filter(h => h !== handler);
    if (this._handlers.length === 0) {
      this._handlers = undefined;
    }
  }
}
