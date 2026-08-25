import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { TrxTransaction } from '@/parser';

/**
 * Tron models each Kiln route as its own contract type, so the mapping is one to one. Matched
 * on that type, not on the witness voted for, which is Kiln configuration.
 */
const OPERATION_BY_CONTRACT: Record<string, string> = {
  'protocol.FreezeBalanceV2Contract': 'stake',
  'protocol.UnfreezeBalanceV2Contract': 'unstake',
  'protocol.CancelAllUnfreezeV2Contract': 'cancel-unstake',
  'protocol.WithdrawExpireUnfreezeContract': 'withdraw-unstaked',
  'protocol.VoteWitnessContract': 'vote',
  'protocol.WithdrawBalanceContract': 'withdraw-rewards',
};

/** `type.googleapis.com/protocol.VoteWitnessContract` → `protocol.VoteWitnessContract`. */
const contractType = (typeUrl: string): string => typeUrl.split('/').pop() ?? typeUrl;

export const classifyTrxTransaction = (transaction: TrxTransaction): TransactionVerdict => {
  const contracts = transaction?.raw?.contractList ?? [];

  if (contracts.length === 0) {
    return unrecognized('This transaction carries no contract.');
  }

  // The decoder renders only the first contract, so a second would be invisible below.
  if (contracts.length > 1) {
    return unrecognized(
      `This transaction bundles ${contracts.length} contracts, and only the first is shown below. Kiln operations carry exactly one.`,
    );
  }

  const type = contractType(contracts[0]?.parameter?.typeUrl ?? '');
  const operation = OPERATION_BY_CONTRACT[type];

  if (!operation) {
    return unrecognized(`This transaction is a ${type || 'nameless contract'}, which is not an operation Kiln crafts.`);
  }

  return recognized(operation);
};
