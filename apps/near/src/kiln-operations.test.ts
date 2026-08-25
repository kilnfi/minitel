import { describe, expect, test } from 'bun:test';
import { KeyPair } from '@near-js/crypto';
import { actionCreators, createTransaction, encodeTransaction } from '@near-js/transactions';
import { classifyNearTransaction } from '@/kiln-operations';
import { parseNearTx } from '@/parser';

/**
 * The actions below mirror how Kiln's transaction-crafting API builds each operation, so a change on either
 * side shows up here rather than in production.
 */

const { addKey, deleteAccount, deployContract, functionCall, fullAccessKey, transfer } = actionCreators;

const wallet = 'kiln-customer.near';
const pool = 'kiln.pool.near';
const publicKey = KeyPair.fromRandom('ed25519').getPublicKey();
const blockHash = new Uint8Array(32).fill(1);

/** 300 Tgas — what Kiln attaches to every call it crafts. */
const MAX_GAS = 300_000_000_000_000n;

/** Serialize an unsigned transaction the way minitel receives it, then run the real parser. */
const classify = (actions: ReturnType<typeof transfer>[]) => {
  const tx = createTransaction(wallet, publicKey, pool, 1n, actions, blockHash);
  const hex = Buffer.from(encodeTransaction(tx)).toString('hex');
  return classifyNearTransaction(parseNearTx(hex));
};

describe('Kiln NEAR operations are recognized', () => {
  test('stake — deposit_and_stake with the staked amount attached', () => {
    const verdict = classify([functionCall('deposit_and_stake', {}, MAX_GAS, 1_000_000_000_000_000_000_000_000n)]);

    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'stake' });
  });

  test('unstake — a partial unstake carries the amount in args', () => {
    const verdict = classify([functionCall('unstake', { amount: '1000' }, MAX_GAS, 0n)]);

    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'unstake' });
  });

  test('unstake — unstake_all is crafted with no args', () => {
    const verdict = classify([functionCall('unstake_all', {}, MAX_GAS, 0n)]);

    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'unstake' });
  });

  test('withdraw — a partial withdrawal carries the amount in args', () => {
    const verdict = classify([functionCall('withdraw', { amount: '1000' }, MAX_GAS, 0n)]);

    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'withdraw' });
  });

  test('withdraw — withdraw_all is crafted with no args', () => {
    const verdict = classify([functionCall('withdraw_all', {}, MAX_GAS, 0n)]);

    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'withdraw' });
  });
});

describe('Non-Kiln NEAR transactions are rejected', () => {
  test('a plain NEAR transfer', () => {
    const verdict = classify([transfer(1_000_000_000_000_000_000_000_000n)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('plain NEAR transfer') });
  });

  test('a function call to a method Kiln never uses', () => {
    const verdict = classify([functionCall('ft_transfer', { receiver_id: 'attacker.near' }, MAX_GAS, 1n)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('ft_transfer()') });
  });

  test('adding a full access key', () => {
    const verdict = classify([addKey(KeyPair.fromRandom('ed25519').getPublicKey(), fullAccessKey())]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('access key addition') });
  });

  test('deleting the account', () => {
    const verdict = classify([deleteAccount('attacker.near')]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('account deletion') });
  });

  test('deploying a contract', () => {
    const verdict = classify([deployContract(new Uint8Array([0, 97, 115, 109]))]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('contract deployment') });
  });

  test('a transfer smuggled alongside a valid unstake', () => {
    const verdict = classify([
      functionCall('unstake_all', {}, MAX_GAS, 0n),
      transfer(1_000_000_000_000_000_000_000_000n),
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('bundles 2 actions') });
  });

  test('withdraw_all with a deposit attached', () => {
    const verdict = classify([functionCall('withdraw_all', {}, MAX_GAS, 1_000_000_000_000_000_000_000_000n)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('attaches a deposit') });
  });

  test('a transaction with no actions at all', () => {
    const verdict = classify([]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('no actions') });
  });
});
