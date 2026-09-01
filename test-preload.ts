// tronweb 6.1.0 ships generated protobuf files that extend a bare `proto` global
// none of them declares, so importing tronweb throws ReferenceError unless the
// object already exists. Under the browser bundle it does; under `bun test` whether
// it did came down to module evaluation order, and the Tron suite passed in a full
// run while failing on its own. Preloading runs before any test module, which is
// the one place the order is not in question. The generated files then fill the
// object in, which is where the parser reads `Transaction` from.
(globalThis as typeof globalThis & { proto?: Record<string, unknown> }).proto ??= {};
