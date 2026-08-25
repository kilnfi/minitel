import { describe, expect, test } from 'bun:test';
// tronweb installs the protobuf runtime the parser reads off globalThis.
import 'tronweb';
import { classifyTrxTransaction } from '@/kiln-operations';
import { parseTrxTx } from '@/parser';

/**
 * Minimal protobuf writers, so each case is a real serialized Tron transaction run through the
 * actual parser rather than a hand-written object.
 */
const varint = (n: number): number[] => {
  const out: number[] = [];
  let value = n;
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value) byte |= 0x80;
    out.push(byte);
  } while (value);
  return out;
};
const lenField = (field: number, payload: number[]): number[] => [
  (field << 3) | 2,
  ...varint(payload.length),
  ...payload,
];
const varField = (field: number, n: number): number[] => [(field << 3) | 0, ...varint(n)];
const utf8 = (s: string): number[] => Array.from(Buffer.from(s, 'utf8'));

const owner = [0x41, ...Array(20).fill(0xab)];
const witness = [0x41, ...Array(20).fill(0xcd)];

/** `Transaction.Contract`: a type tag plus the operation packed into a protobuf Any. */
const contract = (typeName: string, body: number[], typeTag = 0): number[] => [
  ...varField(1, typeTag),
  ...lenField(2, [...lenField(1, utf8(`type.googleapis.com/${typeName}`)), ...lenField(2, body)]),
];

/** `Transaction.raw` — field 11 is the repeated contract list. */
const rawTx = (contracts: number[][]): string =>
  Buffer.from([
    ...lenField(1, [0xb1, 0xf9]),
    ...lenField(4, Array(8).fill(0x11)),
    ...varField(8, 1700000000000),
    ...contracts.flatMap((c) => lenField(11, c)),
    ...varField(14, 1699999000000),
  ]).toString('hex');

const classify = async (contracts: number[][]) => classifyTrxTransaction(await parseTrxTx(rawTx(contracts)));

const freezeV2 = () =>
  contract('protocol.FreezeBalanceV2Contract', [...lenField(1, owner), ...varField(2, 1_000_000), ...varField(3, 1)]);
const unfreezeV2 = () =>
  contract('protocol.UnfreezeBalanceV2Contract', [...lenField(1, owner), ...varField(2, 1_000_000), ...varField(3, 1)]);
const cancelUnfreeze = () => contract('protocol.CancelAllUnfreezeV2Contract', [...lenField(1, owner)]);
const withdrawExpire = () => contract('protocol.WithdrawExpireUnfreezeContract', [...lenField(1, owner)]);
const withdrawBalance = () => contract('protocol.WithdrawBalanceContract', [...lenField(1, owner)]);
const voteWitness = () =>
  contract('protocol.VoteWitnessContract', [
    ...lenField(1, owner),
    ...lenField(2, [...lenField(1, witness), ...varField(2, 100)]),
  ]);

describe('Kiln Tron operations are recognized', () => {
  test('stake — FreezeBalanceV2', async () => {
    expect(await classify([freezeV2()])).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('unstake — UnfreezeBalanceV2', async () => {
    expect(await classify([unfreezeV2()])).toMatchObject({ status: 'recognized', operation: 'unstake' });
  });

  test('cancel-unstake — CancelAllUnfreezeV2', async () => {
    expect(await classify([cancelUnfreeze()])).toMatchObject({ status: 'recognized', operation: 'cancel-unstake' });
  });

  test('withdraw-unstaked — WithdrawExpireUnfreeze', async () => {
    expect(await classify([withdrawExpire()])).toMatchObject({
      status: 'recognized',
      operation: 'withdraw-unstaked',
    });
  });

  test('vote — VoteWitness', async () => {
    expect(await classify([voteWitness()])).toMatchObject({ status: 'recognized', operation: 'vote' });
  });

  test('withdraw-rewards — WithdrawBalance', async () => {
    expect(await classify([withdrawBalance()])).toMatchObject({
      status: 'recognized',
      operation: 'withdraw-rewards',
    });
  });
});

describe('Non-Kiln Tron transactions are rejected', () => {
  test('a plain TRX transfer', async () => {
    const transfer = contract('protocol.TransferContract', [
      ...lenField(1, owner),
      ...lenField(2, witness),
      ...varField(3, 1_000_000),
    ]);
    const verdict = await classify([transfer]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('TransferContract') });
  });

  test('a smart contract call', async () => {
    const trigger = contract('protocol.TriggerSmartContract', [...lenField(1, owner), ...lenField(2, witness)]);
    const verdict = await classify([trigger]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('TriggerSmartContract') });
  });

  test('an account permission update, which can hand over the account', async () => {
    const permission = contract('protocol.AccountPermissionUpdateContract', [...lenField(1, owner)]);
    const verdict = await classify([permission]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('AccountPermissionUpdateContract') });
  });

  test('a transfer smuggled behind a valid freeze, where only the freeze is rendered', async () => {
    const transfer = contract('protocol.TransferContract', [
      ...lenField(1, owner),
      ...lenField(2, witness),
      ...varField(3, 1_000_000),
    ]);
    const verdict = await classify([freezeV2(), transfer]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('bundles 2 contracts') });
  });
});
