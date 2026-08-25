import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import { type DecodedInstruction, getProgramKeyFromId, type InstructionType } from '@/types';

/**
 * The Solana operations Kiln crafts, and the instructions each one is made of.
 *
 * Source of truth is Kiln's transaction-crafting API:
 * `/sol/transaction/{stake,deactivate-stake,withdraw-stake,split-stake,merge-stakes}`.
 * Every one of those is built as a nonce advance followed by a single Stake Program action,
 * so the shape of a genuine Kiln transaction is narrow and checkable.
 *
 * Matching is on operation shape — which programs and instructions appear — not on Kiln's
 * own vote accounts or nonce authorities. Those live in Kiln's configuration and change
 * without minitel knowing; baking them in here would produce a list that silently goes stale
 * and starts rejecting real transactions, which erodes trust in the verdict just as badly as
 * accepting a bad one. A correctly shaped stake to a validator that is not ours still reads
 * as recognized, and the decoded summary below the verdict is where the user checks that.
 */

/**
 * Instructions that carry no value movement and appear as envelope around real operations:
 * fee configuration, the durable-nonce advance every Kiln transaction opens with, and the
 * optional memo. They are ignored when matching so they cannot mask the operation itself.
 */
const ENVELOPE_INSTRUCTIONS: ReadonlySet<InstructionType> = new Set<InstructionType>([
  'AdvanceNonceAccount',
  'SetComputeUnitLimit',
  'SetComputeUnitPrice',
  'RequestUnits',
  'RequestHeapFrame',
  'Memo',
]);

/**
 * The core instruction sequence of each Kiln operation, in order.
 *
 * `stake` is three instructions because StakeProgram.createAccount expands into a System
 * Program account creation followed by the Stake Program initialize, before the delegate.
 * `split-stake` carries the new account's rent-exempt reserve, so a System Program creation
 * may precede the split.
 */
const KILN_OPERATIONS: ReadonlyArray<{ operation: string; sequences: ReadonlyArray<InstructionType[]> }> = [
  {
    operation: 'stake',
    sequences: [
      ['Create', 'Initialize', 'Delegate'],
      ['CreateWithSeed', 'Initialize', 'Delegate'],
    ],
  },
  { operation: 'deactivate-stake', sequences: [['Deactivate']] },
  { operation: 'withdraw-stake', sequences: [['Withdraw']] },
  {
    operation: 'split-stake',
    sequences: [['Split'], ['Create', 'Split'], ['Allocate', 'Assign', 'Split']],
  },
  { operation: 'merge-stakes', sequences: [['Merge']] },
];

const sequencesMatch = (actual: InstructionType[], expected: InstructionType[]): boolean =>
  actual.length === expected.length && actual.every((type, index) => type === expected[index]);

export const classifySolanaTransaction = (instructions: DecodedInstruction[]): TransactionVerdict => {
  if (instructions.length === 0) {
    return unrecognized('This transaction contains no instructions.');
  }

  // Any instruction minitel could not decode, or one from a program outside the four Kiln
  // uses, means the transaction does something we cannot account for. Fail closed before
  // looking at shape at all — an unreadable instruction next to a valid stake is still
  // unreadable.
  const undecodable = instructions.find((i) => i.type === 'unknown' || i.type === 'error');
  if (undecodable) {
    return unrecognized(
      `This transaction contains an instruction minitel could not decode, from program ${undecodable.programId.toString()}.`,
    );
  }

  const foreign = instructions.find((i) => getProgramKeyFromId(i.programId) === undefined);
  if (foreign) {
    return unrecognized(
      `This transaction calls ${foreign.programId.toString()}, which is not a program Kiln operations use.`,
    );
  }

  const core = instructions.map((i) => i.type).filter((type) => !ENVELOPE_INSTRUCTIONS.has(type));

  if (core.length === 0) {
    return unrecognized('This transaction carries no staking instruction.');
  }

  const match = KILN_OPERATIONS.find(({ sequences }) => sequences.some((sequence) => sequencesMatch(core, sequence)));

  if (!match) {
    return unrecognized(
      `This combination of instructions (${core.join(', ')}) does not match any operation Kiln produces on Solana.`,
    );
  }

  return recognized(match.operation);
};
