import type { Transaction } from '@mysten/sui/transactions';
import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';

/**
 * Kiln's Sui routes are short fixed command sequences: stake splits the amount off the gas coin
 * then calls request_add_stake, send splits then transfers, and the rest are a single Move call.
 * Matched on that sequence and the function, not on the validator or recipient.
 */

type TransactionData = ReturnType<typeof Transaction.prototype.getData>;
type Command = TransactionData['commands'][number];

/** The Sui framework package that owns every staking entrypoint. */
const SUI_FRAMEWORK_PACKAGE = '0x0000000000000000000000000000000000000000000000000000000000000003';

/** `module::function` → the Kiln operation, for calls into the framework package above. */
const OPERATION_BY_MOVE_CALL: Record<string, string> = {
  'sui_system::request_add_stake': 'stake',
  'sui_system::request_withdraw_stake': 'unstake',
  'staking_pool::split_staked_sui': 'split-stake',
  'staking_pool::join_staked_sui': 'merge',
};

/** Used only to explain a rejection. */
const describe = (command: Command): string => {
  if (command.$kind === 'MoveCall' && command.MoveCall) {
    const { package: pkg, module, function: fn } = command.MoveCall;
    return `a call to ${pkg === SUI_FRAMEWORK_PACKAGE ? '' : `${pkg}::`}${module}::${fn}`;
  }
  return `a ${command.$kind} command`;
};

const moveCallKey = (command: Command): string | null => {
  if (command.$kind !== 'MoveCall' || !command.MoveCall) return null;
  const { package: pkg, module, function: fn } = command.MoveCall;
  if (pkg !== SUI_FRAMEWORK_PACKAGE) return null;
  return `${module}::${fn}`;
};

export const classifySuiTransaction = (transaction: TransactionData): TransactionVerdict => {
  const commands = transaction?.commands ?? [];

  if (commands.length === 0) {
    return unrecognized('This transaction contains no commands.');
  }

  const kinds = commands.map((command) => command.$kind);

  // send is the one route with no Move call at all, so it is matched before the staking calls.
  if (kinds.length === 2 && kinds[0] === 'SplitCoins' && kinds[1] === 'TransferObjects') {
    return recognized('send');
  }

  const moveCalls = commands.filter((command) => command.$kind === 'MoveCall');

  if (moveCalls.length === 0) {
    return unrecognized(
      `This transaction runs ${commands.map(describe).join(', ')} and calls nothing, so it is not a Kiln operation.`,
    );
  }

  if (moveCalls.length > 1) {
    return unrecognized(
      `This transaction makes ${moveCalls.length} Move calls (${moveCalls.map(describe).join(', ')}). Kiln operations on Sui make one.`,
    );
  }

  const key = moveCallKey(moveCalls[0]);

  if (!key) {
    return unrecognized(`This transaction makes ${describe(moveCalls[0])}, which is not part of the Sui framework.`);
  }

  const operation = OPERATION_BY_MOVE_CALL[key];

  if (!operation) {
    return unrecognized(`This transaction calls ${key}, which is not a function Kiln operations use.`);
  }

  // Staking splits off the gas coin first; the others add nothing around the call.
  const expected = operation === 'stake' ? ['SplitCoins', 'MoveCall'] : ['MoveCall'];
  const matches = kinds.length === expected.length && kinds.every((kind, index) => kind === expected[index]);

  if (!matches) {
    return unrecognized(
      `This transaction wraps ${key} in ${commands.map(describe).join(', ')}, which is not how Kiln crafts it.`,
    );
  }

  return recognized(operation);
};
