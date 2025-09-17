import {
  type AdvanceNonceParams,
  type AllocateParams,
  type AllocateWithSeedParams,
  type AssignParams,
  type AssignWithSeedParams,
  type AuthorizeNonceParams,
  type AuthorizeStakeParams,
  type AuthorizeWithSeedStakeParams,
  ComputeBudgetProgram,
  type CreateAccountParams,
  type CreateAccountWithSeedParams,
  type DeactivateStakeParams,
  type DecodedTransferInstruction,
  type DecodedTransferWithSeedInstruction,
  type DelegateStakeParams,
  type InitializeNonceParams,
  type InitializeStakeParams,
  type MergeStakeParams,
  type RequestHeapFrameParams,
  type RequestUnitsParams,
  type SetComputeUnitLimitParams,
  type SetComputeUnitPriceParams,
  type SplitStakeParams,
  type StakeInstructionType,
  StakeProgram,
  type SystemInstructionType,
  SystemProgram,
  type WithdrawNonceParams,
  type WithdrawStakeParams,
} from '@solana/web3.js';

export type SystemInstructionParams =
  | CreateAccountParams
  | CreateAccountWithSeedParams
  | DecodedTransferInstruction
  | DecodedTransferWithSeedInstruction
  | AllocateParams
  | AllocateWithSeedParams
  | AssignParams
  | AssignWithSeedParams
  | InitializeNonceParams
  | AdvanceNonceParams
  | WithdrawNonceParams
  | AuthorizeNonceParams;

export type StakeInstructionParams =
  | AuthorizeStakeParams
  | AuthorizeWithSeedStakeParams
  | DeactivateStakeParams
  | DelegateStakeParams
  | InitializeStakeParams
  | MergeStakeParams
  | SplitStakeParams
  | WithdrawStakeParams;

export const KNOWN_PROGRAMS = {
  System: {
    id: SystemProgram.programId.toString(),
    name: 'System Program',
  },
  Stake: {
    id: StakeProgram.programId.toString(),
    name: 'Stake Program',
  },
  ComputeBudget: {
    id: ComputeBudgetProgram.programId.toString(),
    name: 'Compute Budget Program',
  },
} as const;

export type ProgramKey = keyof typeof KNOWN_PROGRAMS;

export function getProgramKeyFromId(programId: string): ProgramKey | undefined {
  return Object.entries(KNOWN_PROGRAMS).find(([_, value]) => value.id === programId)?.[0] as ProgramKey | undefined;
}

export function getProgramName(programId: string): string {
  const key = getProgramKeyFromId(programId);
  return key ? KNOWN_PROGRAMS[key].name : 'Unknown Program';
}

export type InstructionType =
  | SystemInstructionType
  | StakeInstructionType
  | 'unknown'
  | 'error'
  | 'SetComputeUnitLimit'
  | 'SetComputeUnitPrice'
  | 'RequestUnits'
  | 'RequestHeapFrame';

export type InstructionParams =
  | SystemInstructionParams
  | StakeInstructionParams
  | SetComputeUnitLimitParams
  | SetComputeUnitPriceParams
  | RequestUnitsParams
  | RequestHeapFrameParams
  | Record<string, unknown>;

export type DecodedInstruction = {
  programId: string;
  type: InstructionType;
  data: InstructionParams;
  error?: string;
  accounts: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  warning?: string;
  raw?: {
    data: string;
    accounts: Array<{
      pubkey: string;
      isSigner: boolean;
      isWritable: boolean;
    }>;
  };
};
