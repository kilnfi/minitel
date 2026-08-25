import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { DecodedAction, NearTransaction } from '@/parser';

/**
 * The NEAR operations Kiln crafts, and the shape each one has.
 *
 * Source of truth is Kiln's transaction-crafting API:
 * `/near/transaction/{stake,unstake,withdraw}`, which the public Kiln Connect spec exposes
 * unchanged. Every one of them builds exactly one FunctionCall against the staking pool, so a
 * genuine Kiln transaction is a single action and nothing else.
 *
 * Matching is on that shape — one function call, a known method, no unexpected deposit — not
 * on the pool account it targets. The pool list lives in Kiln's configuration and changes
 * without minitel knowing; baking it in here would produce a list that silently goes stale and
 * starts rejecting real transactions. The decoded summary below the verdict is where the user
 * checks which pool they are staking with.
 */

/** Human-readable name for an action, used only to explain a rejection. */
const describeAction = (action: DecodedAction): string => {
  switch (action.type) {
    case 'functionCall':
      return `a call to ${action.methodName}()`;
    case 'transfer':
      return 'a plain NEAR transfer';
    case 'createAccount':
      return 'an account creation';
    case 'deleteAccount':
      return 'an account deletion';
    case 'addKey':
      return 'an access key addition';
    case 'deleteKey':
      return 'an access key removal';
    case 'deployContract':
      return 'a contract deployment';
    case 'stake':
      return 'a native validator stake';
    default:
      return 'an action minitel could not decode';
  }
};

export const classifyNearTransaction = (transaction: NearTransaction): TransactionVerdict => {
  const { actions } = transaction;

  if (actions.length === 0) {
    return unrecognized('This transaction contains no actions.');
  }

  // Kiln never batches: stake, unstake and withdraw are each a single FunctionCall. A second
  // action is something we did not craft, however innocent the first one looks.
  if (actions.length > 1) {
    return unrecognized(
      `This transaction bundles ${actions.length} actions (${actions.map(describeAction).join(', ')}). Kiln operations on NEAR carry exactly one.`,
    );
  }

  const action = actions[0];

  if (action.type !== 'functionCall') {
    return unrecognized(`This transaction is ${describeAction(action)}, not a Kiln staking operation.`);
  }

  if (action.stakingOperation === null) {
    return unrecognized(`This transaction calls ${action.methodName}(), which is not a method Kiln operations use.`);
  }

  // unstake and withdraw are crafted with a zero deposit — they move stake that is already in
  // the pool. An attached deposit on either one sends NEAR the user is not expecting to send.
  if (action.stakingOperation !== 'stake' && action.deposit !== '0') {
    return unrecognized(
      `This ${action.methodName}() call attaches a deposit of ${action.deposit} yoctoNEAR. Kiln crafts it with no deposit.`,
    );
  }

  return recognized(action.stakingOperation);
};
