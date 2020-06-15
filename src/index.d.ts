// Type definitions for koji-vcc 1.1.4
// Project: https://github.com/madewithkoji/koji-vcc
// Definitions by: Jeff Peterson <https://github.com/bdjeffyp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.7
import { Config } from './res/config.json';

declare module "@withkoji/vcc" {
  class Handle {
    constructor(onRelease: () => void);
    get isReleased(): boolean;
    release(): boolean;
  }

  interface ConfigDiff {
    newValue: any;
    previousValue: any;
    path: string[];
  }

  interface ConfigDidChangeArgs {
    newValue: any;
    previousValue: any;
    changes: ConfigDiff[];
  }

  type SimpleEventHandler<T> = (value: T) => void;

  export class SimpleEvent<T> {
    subscribe(handler: SimpleEventHandler<T>, includeLast?: boolean): Handle;
    emit(value: T): void;
  }

  export namespace Koji {
    const config: Config;
    const configDidChange: SimpleEvent<ConfigDidChangeArgs>;
    function resolveSecret(key: string): string | null;
    function pageLoad(): void;
    function on(): void;
    function request(): void;
    function pwaPrompt(): void;
  }

  export class InstantRemixing {
    constructor();
    get(path: string[]): any;
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
  }

  export class Keystore {
    constructor(projectId?: string, projectToken?: string);
    resolveValue(keyPath: string): Promise<string>;
  }
}
export default Koji;
