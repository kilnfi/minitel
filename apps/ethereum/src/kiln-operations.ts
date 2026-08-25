import { recognized, type TransactionVerdict, unrecognized, unverified } from '@protocols/shared';
import { isAddressEqual, size, slice } from 'viem';
import { ETHEREUM_CHAIN_IDS } from '@/constant';
import type { AugmentedTransaction } from '@/types';

/**
 * The Ethereum operations Kiln crafts, and the calls each one makes.
 *
 * Source of truth is the crafting service (services/sof/tx: EthService, PolService, MaticService
 * and DefiService) and the public Kiln Connect spec, which expose the same set across
 * `/eth/transaction/*`, `/pol/transaction/*`, `/matic/transaction/*` and `/defi/transaction/*`.
 *
 * Most of them are ordinary contract calls, so the function the transaction decodes to is what
 * identifies the operation. Matching on the function rather than the contract address is
 * deliberate and matches the other chains: the deposit contract, the exit-queue helper and the
 * per-customer onchain-v2 vaults all live in Kiln's configuration and change without minitel
 * knowing. The address→ABI map is still what makes the decode possible, and SEC-358 gates that
 * map on chain id, so a call only reaches this classifier already labelled by a contract Kiln
 * actually deploys on a chain Kiln actually uses.
 *
 * Two operations have no ABI at all: validator exits and consolidations are raw payloads sent
 * to the execution-layer predeploys from EIP-7002 and EIP-7251. Those are Ethereum protocol
 * constants rather than Kiln configuration, so matching them on address plus payload shape is
 * safe from going stale.
 */

/** EIP-7002 withdrawal/exit request predeploy: 48-byte pubkey followed by an 8-byte amount. */
const WITHDRAWAL_REQUEST_PREDEPLOY = '0x00000961Ef480Eb55e80D19ad83579A64c007002' as const;
const WITHDRAWAL_REQUEST_SIZE = 56;

/** EIP-7251 consolidation request predeploy: a 48-byte source and a 48-byte target pubkey. */
const CONSOLIDATION_REQUEST_PREDEPLOY = '0x0000BBdDc7CE488642fb579F8B00f3a590007251' as const;
const CONSOLIDATION_REQUEST_SIZE = 96;

const PUBKEY_SIZE = 48;

/**
 * Decoded function name → the Kiln operation that produces it.
 *
 * EigenLayer's calls are deliberately absent even though the ABIs to decode them are still
 * bundled: Kiln Connect removed EigenLayer support in API v1.10, along with Kava and ZetaChain,
 * so `delegateTo`, `undelegate`, `createPod` and `completeQueuedWithdrawals` are no longer
 * operations Kiln produces.
 *
 * The async-vault operator functions are absent for the same fail-closed reason. `settleDeposit`,
 * `updateNewTotalAssets`, `close` and friends are vault-administration calls that no customer
 * route crafts, so a customer being asked to sign one is exactly the case worth flagging.
 */
const OPERATION_BY_FUNCTION: Record<string, string> = {
  // Native staking — /eth/transaction/{stake,deposit}
  deposit: 'stake',
  batchDeposit: 'stake',
  batchDepositCustom: 'stake',
  bigBatchDeposit: 'stake',
  bigBatchDepositCustom: 'stake',
  // Pooled (onchain v2) staking
  stake: 'stake',
  requestExit: 'exit-request',
  requestValidatorsExit: 'exit-request',
  multiClaim: 'multi-claim',
  // DeFi vaults — /defi/transaction/withdraw crafts redeem when withdrawing everything
  withdraw: 'defi-withdraw',
  redeem: 'defi-withdraw',
  // Polygon — /pol/transaction/* and /matic/transaction/*
  buyVoucher: 'buy-voucher',
  buyVoucherPOL: 'buy-voucher',
  sellVoucher: 'sell-voucher',
  sellVoucherPOL: 'sell-voucher',
  withdrawRewards: 'withdraw-rewards',
  withdrawRewardsPOL: 'withdraw-rewards',
  restake: 'restake-rewards',
  restakePOL: 'restake-rewards',
  unstakeClaimTokens: 'unstake-claim-tokens',
};

/** `deposit` is shared between the beacon deposit contract and the ERC-4626 vault flow. */
const isVaultDeposit = (tx: AugmentedTransaction): boolean => (tx.value ?? 0n) === 0n;

const chainIdOf = (tx: AugmentedTransaction): number | null => (tx.chainId === undefined ? null : Number(tx.chainId));

/**
 * The raw predeploy payloads. An exit is a withdrawal of zero — the same request with the
 * amount field cleared — and enabling compounding is a consolidation of a validator onto
 * itself, so each pair is told apart by reading the payload rather than by a separate address.
 */
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

  // SEC-358: the same contract address means something different on every other EVM chain, so
  // the chain is part of the operation's identity, not a detail below it.
  if (chainId === null) {
    return unrecognized(
      'This transaction declares no chain id, so it cannot be tied to the Ethereum network Kiln operates on.',
    );
  }
  if (!ETHEREUM_CHAIN_IDS.includes(chainId)) {
    return unrecognized(
      `This transaction is for chain ${chainId}. Kiln crafts Ethereum operations on mainnet, sepolia and hoodi only.`,
    );
  }

  if (!tx.to) {
    return unrecognized('This transaction deploys a contract rather than calling one.');
  }

  if (tx.data && tx.data !== '0x') {
    const predeploy = classifyPredeployCall(tx.to, tx.data);
    if (predeploy) return predeploy;
  }

  if (!('inputData' in tx) || !tx.inputData) {
    return unrecognized(
      (tx.value ?? 0n) > 0n && (!tx.data || tx.data === '0x')
        ? 'This transaction is a plain ETH transfer. Kiln staking operations are all contract calls.'
        : 'This transaction calls a contract minitel could not match to any Kiln operation.',
    );
  }

  const { functionName } = tx.inputData;

  // Kiln's DeFi flow crafts an approval, but its whole safety rests on the spender being a Kiln
  // vault — an address that lives in Kiln's configuration and is not knowable here. Calling it
  // recognized would rubber-stamp an approval to a drainer; calling it unrecognized would
  // reject a real operation. It is genuinely the one case minitel cannot answer.
  if (functionName === 'approve') {
    return unverified(
      'This is the shape of the token approval Kiln crafts before a vault deposit, but minitel cannot confirm the spender is a Kiln vault. Check the spender address below against the vault you are depositing into.',
    );
  }

  const operation = OPERATION_BY_FUNCTION[functionName];

  if (!operation) {
    return unrecognized(`This transaction calls ${functionName}(), which is not a function Kiln operations use.`);
  }

  if (operation === 'stake' && functionName === 'deposit' && isVaultDeposit(tx)) {
    return recognized('defi-deposit');
  }

  return recognized(operation);
};
