import { describe, expect, test } from 'bun:test';
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import type { Any } from 'cosmjs-types/google/protobuf/any';
import { createCosmosAdapter } from './cosmos-adapter';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const encodeTx = (messages: Any[]): string => {
  const bodyBytes = TxBody.encode(TxBody.fromPartial({ messages })).finish();
  const authInfoBytes = AuthInfo.encode(AuthInfo.fromPartial({})).finish();
  return toHex(TxRaw.encode(TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [] })).finish());
};

// A dummy protocol shape — generateWarnings/parseTransaction don't read it.
const adapter = createCosmosAdapter({
  name: 'atom',
  displayName: 'Cosmos',
  protocol: { name: 'atom' } as never,
});

describe('createCosmosAdapter warnings', () => {
  test('an unknown typeUrl yields a warning', async () => {
    const hex = encodeTx([{ typeUrl: '/cosmos.gov.v1beta1.MsgVote', value: new Uint8Array([9, 9]) }]);
    const data = await adapter.parseTransaction(hex);

    const warnings = adapter.generateWarnings?.(data) ?? [];
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('Unsupported message type');
    expect(warnings[0].message).toContain('/cosmos.gov.v1beta1.MsgVote');
  });

  test('a plain delegation produces no warnings', async () => {
    const hex = encodeTx([
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        value: MsgDelegate.encode(
          MsgDelegate.fromPartial({
            delegatorAddress: 'cosmos1d',
            validatorAddress: 'cosmosvaloper1v',
            amount: { denom: 'uatom', amount: '1' },
          }),
        ).finish(),
      },
    ]);
    const data = await adapter.parseTransaction(hex);

    expect(adapter.generateWarnings?.(data) ?? []).toHaveLength(0);
  });
});
