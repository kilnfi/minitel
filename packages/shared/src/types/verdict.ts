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
 * For the narrow case where a protocol has an allowlist, the transaction matches the shape of a
 * Kiln operation, but the thing that would make it safe is not knowable here — typically an
 * address that lives in Kiln's configuration.
 *
 * Unlike [pendingAllowlist] this is a considered answer about a specific transaction, so the
 * reason has to name what minitel could not check and what the user should check instead.
 * Reach for it sparingly: a verdict of "maybe" on an operation that could have been decided is
 * worse than either answer.
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
