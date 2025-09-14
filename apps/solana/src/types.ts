import type {
  AdvanceNonceParams,
  AllocateParams,
  AllocateWithSeedParams,
  AssignParams,
  AssignWithSeedParams,
  AuthorizeNonceParams,
  AuthorizeStakeParams,
  AuthorizeWithSeedStakeParams,
  CreateAccountParams,
  CreateAccountWithSeedParams,
  DeactivateStakeParams,
  DecodedTransferInstruction,
  DecodedTransferWithSeedInstruction,
  DelegateStakeParams,
  InitializeNonceParams,
  InitializeStakeParams,
  MergeStakeParams,
  SplitStakeParams,
  StakeInstructionType,
  SystemInstructionType,
  WithdrawNonceParams,
  WithdrawStakeParams,
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

export type DecodedInstruction = {
  programId: string;
  type: SystemInstructionType | StakeInstructionType | 'unknown' | 'error';
  data: SystemInstructionParams | StakeInstructionParams | Record<string, unknown>;
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
