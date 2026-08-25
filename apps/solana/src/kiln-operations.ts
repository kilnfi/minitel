import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import { type DecodedInstruction, getProgramKeyFromId, type InstructionType } from '@/types';

/**
 * Kiln's Solana routes each build a durable-nonce advance plus one Stake Program action.
 * Matched on instruction shape, not on Kiln's vote accounts or nonce authorities: those are
 * Kiln configuration and would go stale here.
 */

/** Fee config, the nonce advance and memos carry no value, so they never mask an operation. */
const ENVELOPE_INSTRUCTIONS: ReadonlySet<InstructionType> = new Set<InstructionType>([
  'AdvanceNonceAccount',
  'SetComputeUnitLimit',
  'SetComputeUnitPrice',
  'RequestUnits',
  'RequestHeapFrame',
  'Memo',
]);

/** `stake` is three instructions because createAccount expands into create + initialize. */
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

  // Fail closed before matching shape: an unreadable instruction next to a valid stake is
  // still unreadable.
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
