// Type definitions for koji-vcc 1.0.2
// Project: https://github.com/madewithkoji/koji-vcc
// Definitions by: Jeff Peterson <https://github.com/bdjeffyp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

declare module "@withkoji/vcc" {
  namespace Koji {
    const config: object;
    function resolveSecret(key: string): string | null;
    function pageLoad(): void;
    function on(): void;
    function request(): void;
    function pwaPrompt(): void;
  }
  export default Koji;
}
