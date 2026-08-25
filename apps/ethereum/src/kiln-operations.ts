import { recognized, type TransactionVerdict, unrecognized, unverified } from '@protocols/shared';
import { isAddressEqual, size, slice } from 'viem';
import { DEFI_CHAIN_IDS, ETHEREUM_CHAIN_IDS } from '@/constant';
import type { AugmentedTransaction } from '@/types';

/**
 * Kiln's Ethereum operations are mostly ordinary contract calls, so the decoded function
 * identifies them — not the contract address, which is Kiln configuration. Validator exits and
 * consolidations have no ABI at all: they are raw payloads to the EIP-7002 and EIP-7251
 * predeploys, which are protocol constants and so safe to match on address plus shape.
 */

/** EIP-7002 withdrawal/exit request predeploy: 48-byte pubkey followed by an 8-byte amount. */
const WITHDRAWAL_REQUEST_PREDEPLOY = '0x00000961Ef480Eb55e80D19ad83579A64c007002' as const;
const WITHDRAWAL_REQUEST_SIZE = 56;

/** EIP-7251 consolidation request predeploy: a 48-byte source and a 48-byte target pubkey. */
const CONSOLIDATION_REQUEST_PREDEPLOY = '0x0000BBdDc7CE488642fb579F8B00f3a590007251' as const;
const CONSOLIDATION_REQUEST_SIZE = 96;

const PUBKEY_SIZE = 48;

/**
 * Two absences are deliberate: EigenLayer's calls, dropped from Kiln Connect in API v1.10, and
 * the async-vault operator functions, which no customer route crafts.
 */
type Scope = 'ethereum' | 'defi';

/** Which chains an operation exists on, and how to say so when it does not. */
const SCOPES: Record<Scope, { chainIds: readonly number[]; where: string }> = {
  ethereum: { chainIds: ETHEREUM_CHAIN_IDS, where: 'mainnet, sepolia and hoodi' },
  defi: { chainIds: DEFI_CHAIN_IDS, where: 'Ethereum, Optimism, BNB Chain, Polygon, Base, Arbitrum and Celo' },
};

const OPERATION_BY_FUNCTION: Record<string, { operation: string; scope: Scope }> = {
  // The beacon deposit is payable, which separates it from the vault deposit of the same name.
  deposit: { operation: 'stake', scope: 'ethereum' },
  batchDeposit: { operation: 'stake', scope: 'ethereum' },
  batchDepositCustom: { operation: 'stake', scope: 'ethereum' },
  bigBatchDeposit: { operation: 'stake', scope: 'ethereum' },
  bigBatchDepositCustom: { operation: 'stake', scope: 'ethereum' },
  // Pooled staking
  stake: { operation: 'stake', scope: 'ethereum' },
  requestExit: { operation: 'exit-request', scope: 'ethereum' },
  requestValidatorsExit: { operation: 'exit-request', scope: 'ethereum' },
  multiClaim: { operation: 'multi-claim', scope: 'ethereum' },
  // DeFi vaults — withdrawing everything is crafted as redeem
  withdraw: { operation: 'defi-withdraw', scope: 'defi' },
  redeem: { operation: 'defi-withdraw', scope: 'defi' },
  // Polygon staking
  buyVoucher: { operation: 'buy-voucher', scope: 'ethereum' },
  buyVoucherPOL: { operation: 'buy-voucher', scope: 'ethereum' },
  sellVoucher: { operation: 'sell-voucher', scope: 'ethereum' },
  sellVoucherPOL: { operation: 'sell-voucher', scope: 'ethereum' },
  withdrawRewards: { operation: 'withdraw-rewards', scope: 'ethereum' },
  withdrawRewardsPOL: { operation: 'withdraw-rewards', scope: 'ethereum' },
  restake: { operation: 'restake-rewards', scope: 'ethereum' },
  restakePOL: { operation: 'restake-rewards', scope: 'ethereum' },
  unstakeClaimTokens: { operation: 'unstake-claim-tokens', scope: 'ethereum' },
};

/** `deposit` is shared between the beacon deposit contract and the ERC-4626 vault flow. */
const isVaultDeposit = (tx: AugmentedTransaction): boolean => (tx.value ?? 0n) === 0n;

const chainIdOf = (tx: AugmentedTransaction): number | null => (tx.chainId === undefined ? null : Number(tx.chainId));

/** An exit is a withdrawal of zero; enabling compounding is a consolidation onto itself. */
const classifyPredeployCall = (to: `0x${string}`, data: `0x${string}`): TransactionVerdict | null => {
  if (isAddressEqual(to, WITHDRAWAL_REQUEST_PREDEPLOY)) {
    if (size(data) !== WITHDRAWAL_REQUEST_SIZE) {
      return unrecognized(
        `This transaction sends ${size(data)} bytes to the withdrawal request predeploy. A Kiln exit or withdrawal request is ${WITHDRAWAL_REQUEST_SIZE} bytes: a validator public key and an amount.`,
      );
    }
    const amount = BigInt(slice(data, PUBKEY_SIZE));
    return recognized(amount === 0n ? 'exit-request' : 'withdrawal');
  }

  if (isAddressEqual(to, CONSOLIDATION_REQUEST_PREDEPLOY)) {
    if (size(data) !== CONSOLIDATION_REQUEST_SIZE) {
      return unrecognized(
        `This transaction sends ${size(data)} bytes to the consolidation request predeploy. A Kiln consolidation is ${CONSOLIDATION_REQUEST_SIZE} bytes: a source and a target validator public key.`,
      );
    }
    const source = slice(data, 0, PUBKEY_SIZE);
    const target = slice(data, PUBKEY_SIZE);
    return recognized(source === target ? 'enable-compounding' : 'consolidate');
  }

  return null;
};

export const classifyEthereumTransaction = (tx: AugmentedTransaction): TransactionVerdict => {
  const chainId = chainIdOf(tx);

  if (chainId === null) {
    return unrecognized('This transaction declares no chain id, so it cannot be tied to a network Kiln operates on.');
  }

  if (!tx.to) {
    return unrecognized('This transaction deploys a contract rather than calling one.');
  }

  /** An operation only counts on a chain that actually offers it. */
  const onSupportedChain = (operation: string, scope: Scope): TransactionVerdict => {
    const { chainIds, where } = SCOPES[scope];
    return chainIds.includes(chainId)
      ? recognized(operation)
      : unrecognized(
          `This transaction is for chain ${chainId}. Kiln crafts ${scope === 'defi' ? 'vault' : 'staking'} operations on ${where}.`,
        );
  };

  if (tx.data && tx.data !== '0x') {
    const predeploy = classifyPredeployCall(tx.to, tx.data);
    // The predeploys exist wherever the EIPs are adopted, but Kiln's validators are on Ethereum.
    if (predeploy) {
      if (predeploy.status !== 'recognized') return predeploy;
      return onSupportedChain(predeploy.operation, 'ethereum');
    }
  }

  if (!('inputData' in tx) || !tx.inputData) {
    return unrecognized(
      (tx.value ?? 0n) > 0n && (!tx.data || tx.data === '0x')
        ? 'This transaction is a plain ETH transfer. Kiln operations are all contract calls.'
        : 'This transaction calls a contract minitel could not match to any Kiln operation.',
    );
  }

  const { functionName } = tx.inputData;

  // The approval's safety rests entirely on the spender being a Kiln vault, which is not
  // knowable here — green would rubber-stamp a drainer, red would reject a real operation.
  if (functionName === 'approve') {
    if (!DEFI_CHAIN_IDS.includes(chainId)) {
      return unrecognized(
        `This transaction is for chain ${chainId}. Kiln crafts vault operations on ${SCOPES.defi.where}.`,
      );
    }
    return unverified(
      'This is the shape of the token approval Kiln crafts before a vault deposit, but minitel cannot confirm the spender is a Kiln vault. Check the spender address below against the vault you are depositing into.',
    );
  }

  const match = OPERATION_BY_FUNCTION[functionName];

  if (!match) {
    return unrecognized(`This transaction calls ${functionName}(), which is not a function Kiln operations use.`);
  }

  // `deposit` is shared: the beacon contract carries ETH, an ERC-4626 vault deposit does not.
  if (functionName === 'deposit' && isVaultDeposit(tx)) {
    return onSupportedChain('defi-deposit', 'defi');
  }

  return onSupportedChain(match.operation, match.scope);
};
