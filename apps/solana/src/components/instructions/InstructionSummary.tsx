import { Address } from '@protocols/ui';
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
  SetComputeUnitLimitParams,
  SetComputeUnitPriceParams,
  SplitStakeParams,
  WithdrawNonceParams,
  WithdrawStakeParams,
} from '@solana/web3.js';
import type { DecodedInstruction } from '@/types';
import { solExplorerLink } from '@/utils';

export function InstructionSummary({ instruction, index }: { instruction: DecodedInstruction; index: number }) {
  const { type, data, error } = instruction;

  if (type === 'error' || error) {
    return <>Failed to decode instruction: {error ?? 'Unknown error'}</>;
  }

  if (type === 'unknown') {
    return (
      <>
        Unknown instruction from{' '}
        <Address
          explorerLink={solExplorerLink(instruction.programId.toString(), 'address')}
          address={instruction.programId.toString()}
          className="text-blue-600 hover:text-blue-800 underline"
        />
      </>
    );
  }

  try {
    switch (type) {
      case 'Memo': {
        const memoData = data as Record<string, unknown>;
        return <>Memo: {memoData.memo ?? 'unknown'}</>;
      }

      // Compute Budget Program Instructions
      case 'SetComputeUnitLimit': {
        const computeBudgetData = data as SetComputeUnitLimitParams;
        return <>Transaction-wide compute unit limit: {computeBudgetData.units ?? 'unknown'} units</>;
      }
      case 'SetComputeUnitPrice': {
        const computeBudgetData = data as SetComputeUnitPriceParams;
        return (
          <>
            Transaction compute unit price: {computeBudgetData.microLamports ?? 'unknown'} microlamports (used for{' '}
            prioritization fees)
          </>
        );
      }

      // System Program Instructions
      case 'AdvanceNonceAccount': {
        const systemData = data as AdvanceNonceParams;
        return (
          <>
            Advance nonce account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.noncePubkey.toString(), 'address')}
              address={systemData.noncePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(systemData.authorizedPubkey.toString(), 'address')}
              address={systemData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Allocate': {
        const systemData = data as AllocateParams;
        return (
          <>
            Allocate {systemData.space ?? 'unknown'} bytes to account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.accountPubkey.toString(), 'address')}
              address={systemData.accountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'AllocateWithSeed': {
        const systemData = data as AllocateWithSeedParams;
        return (
          <>
            Allocate {systemData.space ?? 'unknown'} bytes to account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.accountPubkey.toString(), 'address')}
              address={systemData.accountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            (derived from base{' '}
            <Address
              explorerLink={solExplorerLink(systemData.basePubkey.toString(), 'address')}
              address={systemData.basePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with seed "{systemData.seed}")
          </>
        );
      }
      case 'Assign': {
        const systemData = data as AssignParams;
        return (
          <>
            Assign account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.accountPubkey.toString(), 'address')}
              address={systemData.accountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to program{' '}
            <Address
              explorerLink={solExplorerLink(systemData.programId.toString(), 'address')}
              address={systemData.programId.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'AssignWithSeed': {
        const systemData = data as AssignWithSeedParams;
        return (
          <>
            Assign account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.accountPubkey.toString(), 'address')}
              address={systemData.accountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            (derived from base{' '}
            <Address
              explorerLink={solExplorerLink(systemData.basePubkey.toString(), 'address')}
              address={systemData.basePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with seed "{systemData.seed}") to program{' '}
            <Address
              explorerLink={solExplorerLink(systemData.programId.toString(), 'address')}
              address={systemData.programId.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'AuthorizeNonceAccount': {
        const systemData = data as AuthorizeNonceParams;
        return (
          <>
            Change nonce authority from{' '}
            <Address
              explorerLink={solExplorerLink(systemData.authorizedPubkey.toString(), 'address')}
              address={systemData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to{' '}
            <Address
              explorerLink={solExplorerLink(systemData.newAuthorizedPubkey.toString(), 'address')}
              address={systemData.newAuthorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            on nonce account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.noncePubkey.toString(), 'address')}
              address={systemData.noncePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Create': {
        const systemData = data as CreateAccountParams;
        return (
          <>
            Create account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.newAccountPubkey.toString(), 'address')}
              address={systemData.newAccountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            funded by{' '}
            <Address
              explorerLink={solExplorerLink(systemData.fromPubkey.toString(), 'address')}
              address={systemData.fromPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with {systemData.lamports ?? 'unknown'} lamports ({systemData.space ?? 'unknown'} bytes, owned by{' '}
            <Address
              explorerLink={solExplorerLink(systemData.programId.toString(), 'address')}
              address={systemData.programId.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
            )
          </>
        );
      }
      case 'CreateWithSeed': {
        const systemData = data as CreateAccountWithSeedParams;
        return (
          <>
            Create account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.newAccountPubkey.toString(), 'address')}
              address={systemData.newAccountPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            (derived from base{' '}
            <Address
              explorerLink={solExplorerLink(systemData.basePubkey.toString(), 'address')}
              address={systemData.basePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with seed "{systemData.seed}") funded by{' '}
            <Address
              explorerLink={solExplorerLink(systemData.fromPubkey.toString(), 'address')}
              address={systemData.fromPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with {systemData.lamports ?? 'unknown'} lamports
          </>
        );
      }
      case 'InitializeNonceAccount': {
        const systemData = data as InitializeNonceParams;
        return (
          <>
            Initialize nonce account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.noncePubkey.toString(), 'address')}
              address={systemData.noncePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with authority{' '}
            <Address
              explorerLink={solExplorerLink(systemData.authorizedPubkey.toString(), 'address')}
              address={systemData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Transfer': {
        const systemData = data as DecodedTransferInstruction;
        const lamports = typeof systemData.lamports === 'bigint' ? systemData.lamports.toString() : systemData.lamports;
        return (
          <>
            Transfer {lamports ?? 'unknown'} lamports from{' '}
            <Address
              explorerLink={solExplorerLink(systemData.fromPubkey.toString(), 'address')}
              address={systemData.fromPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to{' '}
            <Address
              explorerLink={solExplorerLink(systemData.toPubkey.toString(), 'address')}
              address={systemData.toPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'TransferWithSeed': {
        const systemData = data as DecodedTransferWithSeedInstruction;
        const lamports = typeof systemData.lamports === 'bigint' ? systemData.lamports.toString() : systemData.lamports;
        return (
          <>
            Transfer {lamports ?? 'unknown'} lamports from{' '}
            <Address
              explorerLink={solExplorerLink(systemData.fromPubkey.toString(), 'address')}
              address={systemData.fromPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            (derived from base{' '}
            <Address
              explorerLink={solExplorerLink(systemData.basePubkey.toString(), 'address')}
              address={systemData.basePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with seed "{systemData.seed}") to{' '}
            <Address
              explorerLink={solExplorerLink(systemData.toPubkey.toString(), 'address')}
              address={systemData.toPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'WithdrawNonceAccount': {
        const systemData = data as WithdrawNonceParams;
        return (
          <>
            Withdraw {systemData.lamports ?? 'unknown'} lamports from nonce account{' '}
            <Address
              explorerLink={solExplorerLink(systemData.noncePubkey.toString(), 'address')}
              address={systemData.noncePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to{' '}
            <Address
              explorerLink={solExplorerLink(systemData.toPubkey.toString(), 'address')}
              address={systemData.toPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(systemData.authorizedPubkey.toString(), 'address')}
              address={systemData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'UpgradeNonceAccount': {
        return 'Upgrade nonce account to latest version';
      }

      // Stake Program Instructions
      case 'Authorize': {
        const stakeData = data as AuthorizeStakeParams;
        const authType =
          stakeData.stakeAuthorizationType?.index === 0
            ? 'Staker'
            : stakeData.stakeAuthorizationType?.index === 1
              ? 'Withdrawer'
              : 'Unknown';
        return (
          <>
            Set {authType} authority from{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.newAuthorizedPubkey.toString(), 'address')}
              address={stakeData.newAuthorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            on stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'AuthorizeWithSeed': {
        const stakeData = data as AuthorizeWithSeedStakeParams;
        const authType =
          stakeData.stakeAuthorizationType?.index === 0
            ? 'Staker'
            : stakeData.stakeAuthorizationType?.index === 1
              ? 'Withdrawer'
              : 'Unknown';
        return (
          <>
            Set {authType} authority using seed-derived key (base:{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorityBase.toString(), 'address')}
              address={stakeData.authorityBase.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
            , seed: "{stakeData.authoritySeed}") to{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.newAuthorizedPubkey.toString(), 'address')}
              address={stakeData.newAuthorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            on stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Deactivate': {
        const stakeData = data as DeactivateStakeParams;
        return (
          <>
            Deactivate stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Delegate': {
        const stakeData = data as DelegateStakeParams;
        return (
          <>
            Delegate stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to validator{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.votePubkey.toString(), 'address')}
              address={stakeData.votePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Initialize': {
        const stakeData = data as InitializeStakeParams;
        return (
          <>
            Initialize stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            with staker authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorized?.staker.toString(), 'address')}
              address={stakeData.authorized?.staker.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            and withdrawer authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorized?.withdrawer.toString(), 'address')}
              address={stakeData.authorized?.withdrawer.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Merge': {
        const stakeData = data as MergeStakeParams;
        return (
          <>
            Merge stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.sourceStakePubKey.toString(), 'address')}
              address={stakeData.sourceStakePubKey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            into{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Split': {
        const stakeData = data as SplitStakeParams;
        return (
          <>
            Split {stakeData.lamports ?? 'unknown'} lamports from stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            into new account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.splitStakePubkey.toString(), 'address')}
              address={stakeData.splitStakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }
      case 'Withdraw': {
        const stakeData = data as WithdrawStakeParams;
        return (
          <>
            Withdraw {stakeData.lamports ?? 'unknown'} lamports from stake account{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.stakePubkey.toString(), 'address')}
              address={stakeData.stakePubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            to{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.toPubkey.toString(), 'address')}
              address={stakeData.toPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />{' '}
            by authority{' '}
            <Address
              explorerLink={solExplorerLink(stakeData.authorizedPubkey.toString(), 'address')}
              address={stakeData.authorizedPubkey.toString()}
              className="text-blue-600 hover:text-blue-800 underline"
            />
          </>
        );
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustiveCheck = type;
        return (
          <>
            {type} instruction #{index + 1}
          </>
        );
      }
    }
  } catch (_err) {
    return (
      <>
        {type} instruction #{index + 1}
      </>
    );
  }
}
