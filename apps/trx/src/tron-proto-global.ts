// tronweb 6.1.0 ships generated protobuf files that extend a bare `proto` global
// none of them declares, so `import 'tronweb'` throws ReferenceError unless the
// object already exists. Whether it did was down to load order — the suite passed
// as a whole and the same test failed alone — so this module creates it, and
// anything reaching for tronweb imports this first. The generated files then fill
// it in, which is where the parser reads `Transaction` from.
(globalThis as typeof globalThis & { proto?: Record<string, unknown> }).proto ??= {};

export {};
