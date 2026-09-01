import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { DecodedAction, NearTransaction } from '@/parser';

/**
 * Kiln's NEAR routes — /near/transaction/{stake,unstake,withdraw} — each build exactly one
 * FunctionCall against the staking pool. Matched on that shape, not on the pool account: the
 * pool list is Kiln configuration and would go stale here.
 */

/** Used only to explain a rejection. */
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

  // Kiln never batches, so a second action is something we did not craft.
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

  // unstake and withdraw move stake already in the pool, so a deposit sends unexpected NEAR.
  if (action.stakingOperation !== 'stake' && action.deposit !== '0') {
    return unrecognized(
      `This ${action.methodName}() call attaches a deposit of ${action.deposit} yoctoNEAR. Kiln crafts it with no deposit.`,
    );
  }

  return recognized(action.stakingOperation);
};
