/**
 * Kiln crafts a closed set of operations per protocol — the crafting routes exposed by the
 * internal tx service. minitel exists so a customer can verify one of those before signing it.
 *
 * A transaction that matches none of them is not something minitel can vouch for, however
 * cleanly it happens to decode. Decoding it generically and rendering a confident summary is
 * the failure mode this type exists to prevent: as protocols grow extensions we do not
 * support, a best-effort decode reads to the user exactly like a verified one.
 */
export type TransactionVerdict =
  /** Matched a known Kiln operation. `operation` names it, e.g. 'stake', 'merge-stakes'. */
  | { status: 'recognized'; operation: string }
  /** The protocol has an allowlist and this transaction matched nothing in it. */
  | { status: 'unrecognized'; reason: string }
  /** The protocol has no allowlist yet, so minitel cannot answer either way. */
  | { status: 'unverified'; reason: string };

export const recognized = (operation: string): TransactionVerdict => ({
  status: 'recognized',
  operation,
});

export const unrecognized = (reason: string): TransactionVerdict => ({
  status: 'unrecognized',
  reason,
});

/**
 * For a transaction that matches a Kiln operation's shape but whose safety turns on something
 * not knowable here — typically an address in Kiln's configuration. The reason must name what
 * to check instead. Use sparingly: a "maybe" on a decidable operation is worse than either answer.
 */
export const unverified = (reason: string): TransactionVerdict => ({
  status: 'unverified',
  reason,
});

/**
 * Verdict for protocols whose Kiln allowlist has not been written yet.
 *
 * `classifyTransaction` is deliberately required on ProtocolAdapter: making the verdict
 * optional is how several decoders came to ship with no safety logic at all, with nothing in
 * the type system objecting. A protocol that has not been done yet has to say so out loud
 * rather than stay silent — and `pendingAllowlist` is greppable, so the remaining work is
 * always countable.
 *
 * This never returns 'recognized'. It cannot produce a false reassurance, only an honest
 * "not checked".
 */
export const pendingAllowlist = (): TransactionVerdict => ({
  status: 'unverified',
  reason:
    'This decoder does not yet know which operations Kiln produces on this chain, so it cannot confirm that this transaction is one of them.',
});
