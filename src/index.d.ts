// Type definitions for koji-vcc 1.0.2
// Project: https://github.com/madewithkoji/koji-vcc
// Definitions by: Jeff Peterson <https://github.com/bdjeffyp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

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

  namespace Koji {
    const config: object;
    const configDidChange: SimpleEvent<ConfigDidChangeArgs>;
    function resolveSecret(key: string): string | null;
    function pageLoad(): void;
    function on(): void;
    function request(): void;
    function pwaPrompt(): void;
  }
  export default Koji;
}
