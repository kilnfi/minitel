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
  WithdrawNonceParams,
  WithdrawStakeParams,
} from '@solana/web3.js';
import { AddressLink } from '@/components/AddressLink';
import type { DecodedInstruction } from '@/types';

export function InstructionSummary({ instruction, index }: { instruction: DecodedInstruction; index: number }) {
  const { type, data, error } = instruction;

  if (type === 'error' || error) {
    return <>Failed to decode instruction: {error || 'Unknown error'}</>;
  }

  if (type === 'unknown') {
    return (
      <>
        Unknown instruction from <AddressLink address={instruction.programId} />
      </>
    );
  }

  try {
    switch (type) {
      // System Program Instructions
      case 'AdvanceNonceAccount': {
        const systemData = data as AdvanceNonceParams;
        return (
          <>
            Advance nonce account <AddressLink address={systemData.noncePubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={systemData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Allocate': {
        const systemData = data as AllocateParams;
        return (
          <>
            Allocate {systemData.space || 'unknown'} bytes to account{' '}
            <AddressLink address={systemData.accountPubkey?.toString() || ''} />
          </>
        );
      }
      case 'AllocateWithSeed': {
        const systemData = data as AllocateWithSeedParams;
        return (
          <>
            Allocate {systemData.space || 'unknown'} bytes to account{' '}
            <AddressLink address={systemData.accountPubkey?.toString() || ''} /> (derived from base{' '}
            <AddressLink address={systemData.basePubkey?.toString() || ''} /> with seed "{systemData.seed}")
          </>
        );
      }
      case 'Assign': {
        const systemData = data as AssignParams;
        return (
          <>
            Assign account <AddressLink address={systemData.accountPubkey?.toString() || ''} /> to program{' '}
            <AddressLink address={systemData.programId?.toString() || ''} />
          </>
        );
      }
      case 'AssignWithSeed': {
        const systemData = data as AssignWithSeedParams;
        return (
          <>
            Assign account <AddressLink address={systemData.accountPubkey?.toString() || ''} /> (derived from base{' '}
            <AddressLink address={systemData.basePubkey?.toString() || ''} /> with seed "{systemData.seed}") to program{' '}
            <AddressLink address={systemData.programId?.toString() || ''} />
          </>
        );
      }
      case 'AuthorizeNonceAccount': {
        const systemData = data as AuthorizeNonceParams;
        return (
          <>
            Change nonce authority from <AddressLink address={systemData.authorizedPubkey?.toString() || ''} /> to{' '}
            <AddressLink address={systemData.newAuthorizedPubkey?.toString() || ''} /> on nonce account{' '}
            <AddressLink address={systemData.noncePubkey?.toString() || ''} />
          </>
        );
      }
      case 'Create': {
        const systemData = data as CreateAccountParams;
        return (
          <>
            Create account <AddressLink address={systemData.newAccountPubkey?.toString() || ''} /> funded by{' '}
            <AddressLink address={systemData.fromPubkey?.toString() || ''} /> with {systemData.lamports || 'unknown'}{' '}
            lamports ({systemData.space || 'unknown'} bytes, owned by{' '}
            <AddressLink address={systemData.programId?.toString() || ''} />)
          </>
        );
      }
      case 'CreateWithSeed': {
        const systemData = data as CreateAccountWithSeedParams;
        return (
          <>
            Create account <AddressLink address={systemData.newAccountPubkey?.toString() || ''} /> (derived from base{' '}
            <AddressLink address={systemData.basePubkey?.toString() || ''} /> with seed "{systemData.seed}") funded by{' '}
            <AddressLink address={systemData.fromPubkey?.toString() || ''} /> with {systemData.lamports || 'unknown'}{' '}
            lamports
          </>
        );
      }
      case 'InitializeNonceAccount': {
        const systemData = data as InitializeNonceParams;
        return (
          <>
            Initialize nonce account <AddressLink address={systemData.noncePubkey?.toString() || ''} /> with authority{' '}
            <AddressLink address={systemData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Transfer': {
        const systemData = data as DecodedTransferInstruction;
        const lamports = typeof systemData.lamports === 'bigint' ? systemData.lamports.toString() : systemData.lamports;
        return (
          <>
            Transfer {lamports || 'unknown'} lamports from{' '}
            <AddressLink address={systemData.fromPubkey?.toString() || ''} /> to{' '}
            <AddressLink address={systemData.toPubkey?.toString() || ''} />
          </>
        );
      }
      case 'TransferWithSeed': {
        const systemData = data as DecodedTransferWithSeedInstruction;
        const lamports = typeof systemData.lamports === 'bigint' ? systemData.lamports.toString() : systemData.lamports;
        return (
          <>
            Transfer {lamports || 'unknown'} lamports from{' '}
            <AddressLink address={systemData.fromPubkey?.toString() || ''} /> (derived from base{' '}
            <AddressLink address={systemData.basePubkey?.toString() || ''} /> with seed "{systemData.seed}") to{' '}
            <AddressLink address={systemData.toPubkey?.toString() || ''} />
          </>
        );
      }
      case 'WithdrawNonceAccount': {
        const systemData = data as WithdrawNonceParams;
        return (
          <>
            Withdraw {systemData.lamports || 'unknown'} lamports from nonce account{' '}
            <AddressLink address={systemData.noncePubkey?.toString() || ''} /> to{' '}
            <AddressLink address={systemData.toPubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={systemData.authorizedPubkey?.toString() || ''} />
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
            Set {authType} authority from <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} /> to{' '}
            <AddressLink address={stakeData.newAuthorizedPubkey?.toString() || ''} /> on stake account{' '}
            <AddressLink address={stakeData.stakePubkey?.toString() || ''} />
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
            <AddressLink address={stakeData.authorityBase?.toString() || ''} />, seed: "{stakeData.authoritySeed}") to{' '}
            <AddressLink address={stakeData.newAuthorizedPubkey?.toString() || ''} /> on stake account{' '}
            <AddressLink address={stakeData.stakePubkey?.toString() || ''} />
          </>
        );
      }
      case 'Deactivate': {
        const stakeData = data as DeactivateStakeParams;
        return (
          <>
            Deactivate stake account <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Delegate': {
        const stakeData = data as DelegateStakeParams;
        return (
          <>
            Delegate stake account <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> to validator{' '}
            <AddressLink address={stakeData.votePubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Initialize': {
        const stakeData = data as InitializeStakeParams;
        return (
          <>
            Initialize stake account <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> with staker
            authority <AddressLink address={stakeData.authorized?.staker?.toString() || ''} /> and withdrawer authority{' '}
            <AddressLink address={stakeData.authorized?.withdrawer?.toString() || ''} />
          </>
        );
      }
      case 'Merge': {
        const stakeData = data as MergeStakeParams;
        return (
          <>
            Merge stake account <AddressLink address={stakeData.sourceStakePubKey?.toString() || ''} /> into{' '}
            <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Split': {
        const stakeData = data as SplitStakeParams;
        return (
          <>
            Split {stakeData.lamports || 'unknown'} lamports from stake account{' '}
            <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> into new account{' '}
            <AddressLink address={stakeData.splitStakePubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} />
          </>
        );
      }
      case 'Withdraw': {
        const stakeData = data as WithdrawStakeParams;
        return (
          <>
            Withdraw {stakeData.lamports || 'unknown'} lamports from stake account{' '}
            <AddressLink address={stakeData.stakePubkey?.toString() || ''} /> to{' '}
            <AddressLink address={stakeData.toPubkey?.toString() || ''} /> by authority{' '}
            <AddressLink address={stakeData.authorizedPubkey?.toString() || ''} />
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
