import { describe, expect, test } from 'bun:test';
import { concat, encodeFunctionData, numberToHex, parseAbi, serializeTransaction } from 'viem';
import {
  EIGENLAYER_DELEGATION_MANAGER_ADDRESS,
  ETH_BEACON_DEPOSIT_CONTRACT_ADDRESS,
  ETH_EXIT_CONTRACT_ADDRESS,
  EXIT_QUEUE_HELPER_ADDRESS,
  MATIC_STAKE_MANAGER_CONTRACT_ADDRESS,
} from '@/constant';
import { classifyEthereumTransaction } from '@/kiln-operations';
import { parseEthTx } from '@/parser';

/**
 * The calls below mirror how Kiln's transaction-crafting API builds each operation, so a change on
 * either side shows up here rather than in production.
 */

const WITHDRAWAL_REQUEST_PREDEPLOY = '0x00000961Ef480Eb55e80D19ad83579A64c007002' as const;
const CONSOLIDATION_REQUEST_PREDEPLOY = '0x0000BBdDc7CE488642fb579F8B00f3a590007251' as const;

const pubkeyA = `0x${'aa'.repeat(48)}` as const;
const pubkeyB = `0x${'bb'.repeat(48)}` as const;

const serialize = ({
  chainId = 1,
  to,
  data = '0x',
  value = 0n,
}: {
  chainId?: number;
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
}) =>
  serializeTransaction({
    type: 'eip1559',
    chainId,
    to,
    data,
    value,
    nonce: 0,
    gas: 200000n,
    maxFeePerGas: 50000000000n,
    maxPriorityFeePerGas: 2000000000n,
  });

/** Serialize, run the real parser, then classify — the whole path a pasted payload takes. */
const classify = async (args: Parameters<typeof serialize>[0]) =>
  classifyEthereumTransaction(await parseEthTx(serialize(args)));

const call = (signature: string, functionName: string, args: readonly unknown[]) =>
  encodeFunctionData({ abi: parseAbi([signature]), functionName, args } as never);

describe('Kiln Ethereum operations are recognized', () => {
  test('exit-request — requestExit on the exit contract', async () => {
    const verdict = await classify({
      to: ETH_EXIT_CONTRACT_ADDRESS,
      data: call('function requestExit(bytes[] validators_) external', 'requestExit', [[pubkeyA]]),
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'exit-request' });
  });

  test('exit-request — a single validator goes to the EIP-7002 predeploy with a zero amount', async () => {
    const verdict = await classify({
      to: WITHDRAWAL_REQUEST_PREDEPLOY,
      data: concat([pubkeyA, numberToHex(0, { size: 8 })]),
      value: 1000n,
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'exit-request' });
  });

  test('withdrawal — the same predeploy with a non-zero amount', async () => {
    const verdict = await classify({
      to: WITHDRAWAL_REQUEST_PREDEPLOY,
      data: concat([pubkeyA, numberToHex(32000000000n, { size: 8 })]),
      value: 1000n,
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'withdrawal' });
  });

  test('consolidate — two different pubkeys to the EIP-7251 predeploy', async () => {
    const verdict = await classify({
      to: CONSOLIDATION_REQUEST_PREDEPLOY,
      data: concat([pubkeyA, pubkeyB]),
      value: 1000n,
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'consolidate' });
  });

  test('enable-compounding — the same pubkey consolidated onto itself', async () => {
    const verdict = await classify({
      to: CONSOLIDATION_REQUEST_PREDEPLOY,
      data: concat([pubkeyA, pubkeyA]),
      value: 1000n,
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'enable-compounding' });
  });

  test('stake — a beacon deposit carrying 32 ETH', async () => {
    const verdict = await classify({
      to: ETH_BEACON_DEPOSIT_CONTRACT_ADDRESS,
      data: call(
        'function deposit(bytes pubkey, bytes withdrawal_credentials, bytes signature, bytes32 deposit_data_root) external payable',
        'deposit',
        [pubkeyA, `0x${'01'.repeat(32)}`, `0x${'cc'.repeat(96)}`, `0x${'dd'.repeat(32)}`],
      ),
      value: 32000000000000000000n,
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('multi-claim — multiClaim on the exit queue helper', async () => {
    const verdict = await classify({
      to: EXIT_QUEUE_HELPER_ADDRESS,
      data: call(
        'function multiClaim(address[] exitQueues, uint256[][] ticketIds, uint32[][] casksIds) external',
        'multiClaim',
        [['0x1111111111111111111111111111111111111111'], [[1n]], [[0]]],
      ),
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'multi-claim' });
  });

  test('buy-voucher — Polygon delegation', async () => {
    const verdict = await classify({
      to: MATIC_STAKE_MANAGER_CONTRACT_ADDRESS,
      data: call(
        'function buyVoucherPOL(uint256 _amount, uint256 _minSharesToMint) returns (uint256)',
        'buyVoucherPOL',
        [1000000000000000000n, 0n],
      ),
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'buy-voucher' });
  });

  test('the testnets Kiln uses are recognized too', async () => {
    for (const chainId of [11155111, 560048]) {
      const verdict = await classify({
        chainId,
        to: ETH_EXIT_CONTRACT_ADDRESS,
        data: call('function requestExit(bytes[] validators_) external', 'requestExit', [[pubkeyA]]),
      });

      expect(verdict).toMatchObject({ status: 'recognized', operation: 'exit-request' });
    }
  });
});

describe('Non-Kiln Ethereum transactions are rejected', () => {
  test('an exit request replayed on Base is rejected — the ABI is never applied there', async () => {
    const verdict = await classify({
      chainId: 8453,
      to: ETH_EXIT_CONTRACT_ADDRESS,
      data: call('function requestExit(bytes[] validators_) external', 'requestExit', [[pubkeyA]]),
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('could not match') });
  });

  test('an exit request to the predeploy on Base names the chain, since predeploys decode anywhere', async () => {
    const verdict = await classify({
      chainId: 8453,
      to: WITHDRAWAL_REQUEST_PREDEPLOY,
      data: concat([pubkeyA, numberToHex(0, { size: 8 })]),
      value: 1000n,
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('chain 8453') });
  });

  test('a vault withdrawal on a chain Kiln has no vaults on', async () => {
    const verdict = await classify({
      chainId: 250,
      to: '0x8888888888888888888888888888888888888888',
      data: call('function redeem(uint256 shares, address receiver, address owner) returns (uint256)', 'redeem', [
        1n,
        '0x1111111111111111111111111111111111111111',
        '0x1111111111111111111111111111111111111111',
      ]),
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('chain 250') });
  });

  test('EigenLayer delegateTo — dropped from Kiln Connect in API v1.10', async () => {
    const verdict = await classify({
      to: EIGENLAYER_DELEGATION_MANAGER_ADDRESS,
      data: call(
        'function undelegate(address staker) external returns (bytes32[] memory withdrawalRoots)',
        'undelegate',
        ['0x1111111111111111111111111111111111111111'],
      ),
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('undelegate()') });
  });

  test('a vault administration call no customer route crafts', async () => {
    const verdict = await classify({
      to: '0x4444444444444444444444444444444444444444',
      data: call('function updateNewTotalAssets(uint256 newTotalAssets) external', 'updateNewTotalAssets', [1n]),
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('updateNewTotalAssets()') });
  });

  test('a plain ETH transfer', async () => {
    const verdict = await classify({ to: '0x5555555555555555555555555555555555555555', value: 10n ** 18n });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('plain ETH transfer') });
  });

  test('an ERC-20 transfer', async () => {
    const verdict = await classify({
      to: '0x6666666666666666666666666666666666666666',
      data: call('function transfer(address to, uint256 amount) returns (bool)', 'transfer', [
        '0x1111111111111111111111111111111111111111',
        1n,
      ]),
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('transfer()') });
  });

  test('a malformed payload to the withdrawal predeploy', async () => {
    const verdict = await classify({
      to: WITHDRAWAL_REQUEST_PREDEPLOY,
      data: `0x${'ab'.repeat(20)}`,
      value: 1000n,
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('20 bytes') });
  });
});

describe('Vault operations are multi-chain, unlike staking', () => {
  test.each([
    ['Base', 8453],
    ['Arbitrum', 42161],
    ['Optimism', 10],
    ['Polygon', 137],
    ['Celo', 42220],
  ])('an ERC-4626 vault deposit on %s is recognized', async (_name, chainId) => {
    const verdict = await classify({
      chainId,
      to: '0x8888888888888888888888888888888888888888',
      data: call('function deposit(uint256 assets, address receiver) returns (uint256)', 'deposit', [
        1000000n,
        '0x1111111111111111111111111111111111111111',
      ]),
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'defi-deposit' });
  });

  test('a vault withdrawal on Base is recognized', async () => {
    const verdict = await classify({
      chainId: 8453,
      to: '0x8888888888888888888888888888888888888888',
      data: call('function withdraw(uint256 assets, address receiver, address owner) returns (uint256)', 'withdraw', [
        1000000n,
        '0x1111111111111111111111111111111111111111',
        '0x1111111111111111111111111111111111111111',
      ]),
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'defi-withdraw' });
  });
});

describe('The one call minitel cannot decide', () => {
  test('approve on Base is unverified, because the spender is not knowable here', async () => {
    const verdict = await classify({
      chainId: 8453,
      to: '0x7777777777777777777777777777777777777777',
      data: call('function approve(address spender, uint256 amount) returns (bool)', 'approve', [
        '0x2222222222222222222222222222222222222222',
        2n ** 256n - 1n,
      ]),
    });

    expect(verdict.status).toBe('unverified');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('spender') });
  });
});
