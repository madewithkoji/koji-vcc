import Handle from './Handle';

export default class SimpleEvent {
  constructor() {
    this.handlers = undefined;
  }

  subscribe(handler, includeLast = false) {
    if (this.handlers == null) {
      this.handlers = [];
    }
    this.handlers.push(handler);
    if (this.lastEvent != null && includeLast) {
      handler(this.lastEvent);
    }
    return new Handle(() => this.unsubscribe(handler));
  }

  emit(event) {
    if (this.handlers != null) {
      this.handlers.forEach((handler) => {
        handler(event, this.lastEvent);
      });
    }
    this.lastEvent = event;
  }

  unsubscribe(handler) {
    if (this.handlers == null) {
      return;
    }
    this.handlers = this.handlers.filter((h) => h !== handler);
    if (this.handlers.length === 0) {
      this.handlers = undefined;
    }
  }
}
