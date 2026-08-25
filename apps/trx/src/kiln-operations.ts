import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { TrxTransaction } from '@/parser';

/**
 * The Tron operations Kiln crafts, one contract type each.
 *
 * Source of truth is Kiln's transaction-crafting API, which the public Kiln Connect spec
 * exposes as `/trx/transaction/{stake,unstake,cancel-unstake,withdraw-unstaked,vote,
 * withdraw-rewards}`. Tron models each of these as a distinct contract type, so the mapping is
 * one to one and there is nothing to match on beyond the type itself.
 *
 * Matching is on the contract type, not on the witness being voted for. The validator list
 * lives in Kiln's configuration and changes without minitel knowing; the decoded summary below
 * the verdict is where the user checks which witness their votes go to.
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

  // The decoder only ever renders the first contract, so a second one would be invisible in the
  // summary below. Every Kiln operation is a single contract, and Tron itself has never
  // supported more, but rejecting the case is what keeps the summary honest about what it shows.
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
