import { describe, expect, test } from 'bun:test';
import type { CertificateJSON, TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { classifyAdaTransaction } from '@/kiln-operations';

/**
 * These build the decoded JSON directly rather than round-tripping through the serialization
 * library: its browser WASM build does not initialize under the test runner, so a real
 * transaction cannot be forged here. The shapes below follow CertificateJSON and
 * TransactionBodyJSON, which is what the parser hands the classifier.
 */

const keyCredential = { Key: '00'.repeat(28) };
const poolKeyhash = '11'.repeat(28);
const rewardAddress = `e0${'22'.repeat(28)}`;

const tx = ({
  certs,
  withdrawals,
  ...rest
}: {
  certs?: CertificateJSON[];
  withdrawals?: Record<string, string>;
  mint?: unknown;
  voting_proposals?: unknown[];
}): TransactionJSON =>
  ({
    body: {
      inputs: [],
      outputs: [],
      fee: '200000',
      ...(certs ? { certs } : {}),
      ...(withdrawals ? { withdrawals } : {}),
      ...rest,
    },
    witness_set: { vkeys: [] },
    is_valid: true,
  }) as TransactionJSON;

const stakeRegistration = { StakeRegistration: { stake_credential: keyCredential } } as CertificateJSON;
const stakeAndVoteDelegation = {
  StakeAndVoteDelegation: { stake_credential: keyCredential, pool_keyhash: poolKeyhash, drep: 'AlwaysAbstain' },
} as CertificateJSON;
const stakeDeregistration = { StakeDeregistration: { stake_credential: keyCredential } } as CertificateJSON;

describe('Kiln Cardano operations are recognized', () => {
  test('stake — a first-time key registers and delegates', () => {
    const verdict = classifyAdaTransaction(tx({ certs: [stakeRegistration, stakeAndVoteDelegation] }));

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('stake — an already-registered key just delegates', () => {
    const verdict = classifyAdaTransaction(tx({ certs: [stakeAndVoteDelegation] }));

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('unstake — deregistration sweeping the outstanding rewards', () => {
    const verdict = classifyAdaTransaction(
      tx({ certs: [stakeDeregistration], withdrawals: { [rewardAddress]: '4200000' } }),
    );

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'unstake' });
  });

  test('withdraw-rewards — a withdrawals map and no certificate', () => {
    const verdict = classifyAdaTransaction(tx({ withdrawals: { [rewardAddress]: '4200000' } }));

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'withdraw-rewards' });
  });
});

describe('Non-Kiln Cardano transactions are rejected', () => {
  test('a plain transfer with neither certificate nor withdrawal', () => {
    const verdict = classifyAdaTransaction(tx({}));

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('plain transfer') });
  });

  test('registering a stake pool', () => {
    const verdict = classifyAdaTransaction(
      tx({ certs: [{ PoolRegistration: { pool_params: {} } } as never as CertificateJSON] }),
    );

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('PoolRegistration') });
  });

  test('a DRep registration riding alongside a delegation', () => {
    const verdict = classifyAdaTransaction(
      tx({
        certs: [stakeAndVoteDelegation, { DRepRegistration: { voting_credential: keyCredential } } as never],
      }),
    );

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('DRepRegistration') });
  });

  test('a deregistration bundled with a delegation', () => {
    const verdict = classifyAdaTransaction(tx({ certs: [stakeDeregistration, stakeAndVoteDelegation] }));

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('StakeDeregistration + StakeAndVoteDelegation') });
  });

  test('a token mint alongside a valid delegation', () => {
    const verdict = classifyAdaTransaction(tx({ certs: [stakeAndVoteDelegation], mint: [{ policy: 'x' }] }));

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('mints or burns') });
  });

  test('a governance proposal alongside a valid delegation', () => {
    const verdict = classifyAdaTransaction(
      tx({ certs: [stakeAndVoteDelegation], voting_proposals: [{ deposit: '1' }] }),
    );

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('governance') });
  });
});
