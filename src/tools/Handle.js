export default class Handle {
  constructor(onRelease) {
    this.release = () => {
      if (this.releaseFn == null) {
        return false;
      }
      this.releaseFn();
      this.releaseFn = undefined;
      return true;
    };
    this.releaseFn = onRelease;
  }

  get isReleased() {
    return this.releaseFn == null;
  }
}
