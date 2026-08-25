import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { ForgeParams } from '@taquito/local-forging';

/**
 * The Tezos operations Kiln crafts, and the operation each one forges.
 *
 * Source of truth is Kiln's transaction-crafting API, which the public Kiln Connect spec
 * exposes as `/xtz/transaction/{stake,unstake,finalize-unstake,delegate,undelegate}`:
 *
 * - stake, unstake and finalize-unstake are self-transactions — source and destination are the
 *   same account — calling the protocol entrypoint of the same name.
 * - delegate sets a baker, undelegate clears it. Both are delegation operations, told apart by
 *   whether a delegate is present.
 *
 * Matching is on the operation kind and entrypoint, not on the baker being delegated to. The
 * baker address is chosen per customer and lives outside minitel; the decoded summary below the
 * verdict is where the user checks it.
 *
 * A reveal may legitimately precede any of these the first time an account transacts, so it is
 * treated as envelope rather than as a second operation.
 */

type OperationContent = ForgeParams['contents'][number];

/** Entrypoint → operation, for the three self-transaction forms. */
const OPERATION_BY_ENTRYPOINT: Record<string, string> = {
  stake: 'stake',
  unstake: 'unstake',
  finalize_unstake: 'finalize-unstake',
};

/**
 * Revealing the public key is a one-off the protocol requires before an account's first
 * operation, and Kiln's crafting prepends it when needed. It moves no funds.
 */
const isReveal = (content: OperationContent): boolean => content.kind === 'reveal';

const describe = (content: OperationContent): string => {
  const { kind } = content;
  if (kind === 'transaction') {
    const entrypoint = (content as { parameters?: { entrypoint?: string } }).parameters?.entrypoint;
    return entrypoint ? `a call to the ${entrypoint} entrypoint` : 'a plain tez transfer';
  }
  return `a ${kind} operation`;
};

export const classifyXtzTransaction = (transaction: ForgeParams): TransactionVerdict => {
  const contents = transaction?.contents ?? [];
  const operations = contents.filter((content) => !isReveal(content));

  if (contents.length === 0) {
    return unrecognized('This transaction contains no operations.');
  }

  if (operations.length === 0) {
    return unrecognized('This transaction only reveals a public key and carries no Kiln operation.');
  }

  if (operations.length > 1) {
    return unrecognized(
      `This transaction bundles ${operations.length} operations (${operations.map(describe).join(', ')}). Kiln operations on Tezos carry one.`,
    );
  }

  const operation = operations[0];

  if (operation.kind === 'delegation') {
    // Taquito omits the field entirely when the delegation is being cleared.
    const delegate = (operation as { delegate?: string }).delegate;
    return recognized(delegate ? 'delegate' : 'undelegate');
  }

  if (operation.kind !== 'transaction') {
    return unrecognized(`This transaction is ${describe(operation)}, which is not an operation Kiln crafts.`);
  }

  const transactionOp = operation as {
    source?: string;
    destination?: string;
    parameters?: { entrypoint?: string };
  };
  const entrypoint = transactionOp.parameters?.entrypoint;

  if (!entrypoint) {
    return unrecognized('This transaction is a plain tez transfer, not a Kiln staking operation.');
  }

  const matched = OPERATION_BY_ENTRYPOINT[entrypoint];

  if (!matched) {
    return unrecognized(`This transaction calls the ${entrypoint} entrypoint, which Kiln operations do not use.`);
  }

  // Staking on Tezos moves funds within your own account, so the destination is the source.
  // A stake entrypoint aimed elsewhere is a contract call wearing a familiar name.
  if (transactionOp.source && transactionOp.destination && transactionOp.source !== transactionOp.destination) {
    return unrecognized(
      `This transaction calls the ${entrypoint} entrypoint on ${transactionOp.destination}, not on your own account. Kiln stakes to your own account.`,
    );
  }

  return recognized(matched);
};
