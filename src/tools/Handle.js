export default class Handle {
  constructor(onRelease) {
    this.release = () => {
      if (this._releaseFn == null) {
        return false;
      }
      this._releaseFn();
      this._releaseFn = undefined;
      return true;
    };
    this._releaseFn = onRelease;
  }
  get isReleased() {
    return this._releaseFn == null;
  }
}
