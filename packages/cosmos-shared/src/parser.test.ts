import { describe, expect, test } from 'bun:test';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import type { Any } from 'cosmjs-types/google/protobuf/any';
import { parseCosmosTx } from './parser';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

// Encode a minimal signed-tx envelope around the given messages, mirroring the
// real TxRaw bytes the decoder receives from a Fireblocks raw-signing payload.
const encodeTx = (messages: Any[], memo = ''): string => {
  const bodyBytes = TxBody.encode(TxBody.fromPartial({ messages, memo })).finish();
  const authInfoBytes = AuthInfo.encode(
    AuthInfo.fromPartial({ fee: { amount: [{ denom: 'uatom', amount: '5000' }], gasLimit: 200000n } }),
  ).finish();
  const txRaw = TxRaw.encode(TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [] })).finish();
  return toHex(txRaw);
};

const delegateMsg = (validatorAddress: string, delegatorAddress = 'cosmos1delegator', amount = '1000000'): Any => ({
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
  value: MsgDelegate.encode(
    MsgDelegate.fromPartial({ delegatorAddress, validatorAddress, amount: { denom: 'uatom', amount } }),
  ).finish(),
});

describe('parseCosmosTx', () => {
  test('decodes a MsgDelegate into validator, delegator and amount', async () => {
    const hex = encodeTx([delegateMsg('cosmosvaloper1validator')]);

    const tx = await parseCosmosTx(hex);

    expect(tx.messages).toHaveLength(1);
    const message = tx.messages[0];
    expect(message.kind).toBe('delegate');
    if (message.kind !== 'delegate') throw new Error('expected delegate');
    expect(message.delegatorAddress).toBe('cosmos1delegator');
    expect(message.validatorAddress).toBe('cosmosvaloper1validator');
    expect(message.amount).toEqual({ denom: 'uatom', amount: '1000000' });
    expect(tx.fee).toEqual({
      amount: [{ denom: 'uatom', amount: '5000' }],
      gasLimit: '200000',
      payer: '',
      granter: '',
    });
  });

  test('trims surrounding whitespace so decoding matches the hashed bytes', async () => {
    const hex = encodeTx([delegateMsg('cosmosvaloper1validator')]);

    const tx = await parseCosmosTx(`  \n${hex}\n  `);

    const message = tx.messages[0];
    expect(message.kind).toBe('delegate');
    if (message.kind !== 'delegate') throw new Error('expected delegate');
    expect(message.validatorAddress).toBe('cosmosvaloper1validator');
  });

  test('rejects malformed hex instead of decoding garbage', async () => {
    await expect(parseCosmosTx('not-hex')).rejects.toThrow('Invalid Cosmos transaction hex');
    await expect(parseCosmosTx('abc')).rejects.toThrow('Invalid Cosmos transaction hex');
  });

  test('two delegations differing only in validator parse to different validatorAddress', async () => {
    const a = await parseCosmosTx(encodeTx([delegateMsg('cosmosvaloper1AAA')]));
    const b = await parseCosmosTx(encodeTx([delegateMsg('cosmosvaloper1BBB')]));

    const msgA = a.messages[0];
    const msgB = b.messages[0];
    if (msgA.kind !== 'delegate' || msgB.kind !== 'delegate') throw new Error('expected delegate');
    expect(msgA.validatorAddress).toBe('cosmosvaloper1AAA');
    expect(msgB.validatorAddress).toBe('cosmosvaloper1BBB');
    expect(msgA.validatorAddress).not.toBe(msgB.validatorAddress);
  });

  test('an unknown typeUrl fails closed as unsupported', async () => {
    const unknown: Any = {
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      value: new Uint8Array([1, 2, 3, 4]),
    };
    const tx = await parseCosmosTx(encodeTx([unknown]));

    const message = tx.messages[0];
    expect(message.kind).toBe('unsupported');
    if (message.kind !== 'unsupported') throw new Error('expected unsupported');
    expect(message.typeUrl).toBe('/cosmos.gov.v1beta1.MsgVote');
    expect(message.raw).toBe('01020304');
  });

  test('decodes a MsgSend with its recipient and coins', async () => {
    const send: Any = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: MsgSend.encode(
        MsgSend.fromPartial({
          fromAddress: 'cosmos1from',
          toAddress: 'cosmos1to',
          amount: [{ denom: 'uatom', amount: '42' }],
        }),
      ).finish(),
    };
    const tx = await parseCosmosTx(encodeTx([send]));

    const message = tx.messages[0];
    expect(message.kind).toBe('send');
    if (message.kind !== 'send') throw new Error('expected send');
    expect(message.toAddress).toBe('cosmos1to');
    expect(message.amount).toEqual([{ denom: 'uatom', amount: '42' }]);
  });
});
