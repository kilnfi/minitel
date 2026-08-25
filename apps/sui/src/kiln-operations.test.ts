import { describe, expect, test } from 'bun:test';
import { Transaction } from '@mysten/sui/transactions';
import { classifySuiTransaction } from '@/kiln-operations';
import { parseSuiTx } from '@/parser';

/** Each case is built with the same library Kiln uses and run back through the real parser. */

const sender = `0x${'11'.repeat(32)}`;
const validator = `0x${'22'.repeat(32)}`;
const recipient = `0x${'44'.repeat(32)}`;
const stakeId = `0x${'55'.repeat(32)}`;
const otherStakeId = `0x${'66'.repeat(32)}`;
const SUI_SYSTEM_STATE = `0x${'0'.repeat(63)}5`;

/** The shared system-state object, spelled out so the transaction builds without a client. */
const systemState = (tx: Transaction) =>
  tx.sharedObjectRef({ objectId: SUI_SYSTEM_STATE, initialSharedVersion: '1', mutable: true });

/** An owned object reference, likewise fully specified. */
const owned = (tx: Transaction, objectId: string) =>
  tx.objectRef({ objectId, version: '1', digest: '11111111111111111111111111111111' });

const build = async (fill: (tx: Transaction) => void) => {
  const tx = new Transaction();
  tx.setSender(sender);
  tx.setGasPrice(1000n);
  tx.setGasBudget(10_000_000n);
  tx.setGasPayment([{ objectId: `0x${'33'.repeat(32)}`, version: '1', digest: '11111111111111111111111111111111' }]);
  fill(tx);
  return Buffer.from(await tx.build()).toString('hex');
};

const classify = async (fill: (tx: Transaction) => void) => classifySuiTransaction(await parseSuiTx(await build(fill)));

describe('Kiln Sui operations are recognized', () => {
  test('stake — split off the gas coin, then request_add_stake', async () => {
    const verdict = await classify((tx) => {
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000_000n)]);
      tx.moveCall({
        target: '0x3::sui_system::request_add_stake',
        arguments: [systemState(tx), coin, tx.pure.address(validator)],
      });
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('unstake — request_withdraw_stake', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::sui_system::request_withdraw_stake',
        arguments: [systemState(tx), owned(tx, stakeId)],
      });
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'unstake' });
  });

  test('split-stake — split_staked_sui', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::staking_pool::split_staked_sui',
        arguments: [owned(tx, stakeId), tx.pure.u64(500_000_000n)],
      });
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'split-stake' });
  });

  test('merge — join_staked_sui', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::staking_pool::join_staked_sui',
        arguments: [owned(tx, stakeId), owned(tx, otherStakeId)],
      });
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'merge' });
  });

  test('send — split off the gas coin, then transfer it', async () => {
    const verdict = await classify((tx) => {
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000n)]);
      tx.transferObjects([coin], tx.pure.address(recipient));
    });

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'send' });
  });
});

describe('Non-Kiln Sui transactions are rejected', () => {
  test('a call into a package that is not the Sui framework', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: `0x${'ab'.repeat(32)}::drainer::take_everything`,
        arguments: [owned(tx, stakeId)],
      });
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('not part of the Sui framework') });
  });

  test('a framework call Kiln never makes', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::sui_system::request_add_validator',
        arguments: [systemState(tx)],
      });
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('request_add_validator') });
  });

  test('a transfer smuggled in after a valid unstake', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::sui_system::request_withdraw_stake',
        arguments: [systemState(tx), owned(tx, stakeId)],
      });
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000n)]);
      tx.transferObjects([coin], tx.pure.address(recipient));
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('which is not how Kiln crafts it') });
  });

  test('two staking calls in one transaction', async () => {
    const verdict = await classify((tx) => {
      tx.moveCall({
        target: '0x3::sui_system::request_withdraw_stake',
        arguments: [systemState(tx), owned(tx, stakeId)],
      });
      tx.moveCall({
        target: '0x3::staking_pool::join_staked_sui',
        arguments: [owned(tx, otherStakeId), owned(tx, stakeId)],
      });
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('2 Move calls') });
  });

  test('transferring a staked object outright, with no call at all', async () => {
    const verdict = await classify((tx) => {
      tx.transferObjects([owned(tx, stakeId)], tx.pure.address(recipient));
    });

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('calls nothing') });
  });
});
