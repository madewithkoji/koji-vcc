// Type definitions for koji-vcc 1.1.4
// Project: https://github.com/madewithkoji/koji-vcc
// Definitions by: Jeff Peterson <https://github.com/bdjeffyp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.7
import { Config } from './res/config.json';

declare module "@withkoji/vcc" {
  export namespace Koji {
    const config: Config;
  }

  export class InstantRemixing {
    constructor();
    get(path: string[]): any;
    onSetValue(fn: (path: string[], newValue: any) => void): void;
    onValueChanged(fn: (path: string[], newValue: any) => void): void;
    onSetRemixing(fn: (isRemixing: boolean) => void): void;
    onSetActivePath(fn: (activePath: string[]|null) => void): void;
    ready(): void;
    addVisibilityListener(fn: (isVisible: boolean) => void): void;

    remixingActivePath: string[]|null;
    isRemixing: boolean;
    onPresentControl(path: string[], attributes: {[index: string]: any}): void;
  }

  export class FeedSdk {
    constructor();
    load(): void;
    requestCancelTouch(): void;
    onPlaybackStateChanged(fn: (isPlaying: boolean) => void): void;
    navigate(url: string): void;
    present(url: string): void;
  }

  export class Keystore {
    constructor(projectId?: string, projectToken?: string);
    resolveValue(keyPath: string): Promise<string>;
  }
}

export default Koji;
