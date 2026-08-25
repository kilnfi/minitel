import { describe, expect, test } from 'bun:test';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { AuthorizationType, StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import type { Any } from 'cosmjs-types/google/protobuf/any';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { type CosmosChainName, classifyCosmosTransaction } from './kiln-operations';
import { parseCosmosTx } from './parser';

/**
 * The messages below mirror how services/sof/tx (CosmosMessages + CosmosServiceV2) builds each
 * operation, so a change on either side shows up here rather than in production.
 */

const delegator = 'cosmos1delegator';
const validator = 'cosmosvaloper1kiln';
const grantee = 'cosmos1kilnrestaker';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const encodeTx = (messages: Any[]): string => {
  const bodyBytes = TxBody.encode(TxBody.fromPartial({ messages })).finish();
  const authInfoBytes = AuthInfo.encode(AuthInfo.fromPartial({})).finish();
  return toHex(TxRaw.encode(TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [] })).finish());
};

const classify = async (chain: CosmosChainName, messages: Any[]) =>
  classifyCosmosTransaction(chain, await parseCosmosTx(encodeTx(messages)));

const delegateMsg = (): Any => ({
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
  value: MsgDelegate.encode(
    MsgDelegate.fromPartial({
      delegatorAddress: delegator,
      validatorAddress: validator,
      amount: { denom: 'uatom', amount: '1000000' },
    }),
  ).finish(),
});

const undelegateMsg = (): Any => ({
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
  value: MsgUndelegate.encode(
    MsgUndelegate.fromPartial({
      delegatorAddress: delegator,
      validatorAddress: validator,
      amount: { denom: 'uatom', amount: '1000000' },
    }),
  ).finish(),
});

const redelegateMsg = (): Any => ({
  typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  value: MsgBeginRedelegate.encode(
    MsgBeginRedelegate.fromPartial({
      delegatorAddress: delegator,
      validatorSrcAddress: validator,
      validatorDstAddress: 'cosmosvaloper1other',
      amount: { denom: 'uatom', amount: '1000000' },
    }),
  ).finish(),
});

const withdrawRewardsMsg = (): Any => ({
  typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  value: MsgWithdrawDelegatorReward.encode(
    MsgWithdrawDelegatorReward.fromPartial({ delegatorAddress: delegator, validatorAddress: validator }),
  ).finish(),
});

const sendMsg = (toAddress = 'cosmos1recipient'): Any => ({
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  value: MsgSend.encode(
    MsgSend.fromPartial({
      fromAddress: delegator,
      toAddress,
      amount: [{ denom: 'uatom', amount: '1000000' }],
    }),
  ).finish(),
});

/** The MsgGrant CosmosMessages.getRestakeRewardsMsg builds. */
const restakeGrantMsg = (authorizationType = AuthorizationType.AUTHORIZATION_TYPE_DELEGATE): Any => ({
  typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
  value: MsgGrant.encode(
    MsgGrant.fromPartial({
      granter: delegator,
      grantee,
      grant: {
        expiration: { seconds: 1n },
        authorization: {
          typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
          value: StakeAuthorization.encode(
            StakeAuthorization.fromPartial({
              allowList: { address: [validator] },
              authorizationType,
            }),
          ).finish(),
        },
      },
    }),
  ).finish(),
});

const revokeRestakeMsg = (msgTypeUrl = '/cosmos.staking.v1beta1.MsgDelegate'): Any => ({
  typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
  value: MsgRevoke.encode(MsgRevoke.fromPartial({ granter: delegator, grantee, msgTypeUrl })).finish(),
});

/** The MsgTransfer dYdX's noble-ibc-transfer route builds. */
const ibcTransferMsg = (): Any => ({
  typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
  value: MsgTransfer.encode(
    MsgTransfer.fromPartial({
      sourcePort: 'transfer',
      sourceChannel: 'channel-0',
      token: { denom: 'ibc/8E27BA2D', amount: '1000000' },
      sender: 'dydx1delegator',
      receiver: 'noble1delegator',
    }),
  ).finish(),
});

describe('Kiln Cosmos operations are recognized', () => {
  test('stake', async () => {
    expect(await classify('atom', [delegateMsg()])).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('unstake', async () => {
    expect(await classify('atom', [undelegateMsg()])).toMatchObject({ status: 'recognized', operation: 'unstake' });
  });

  test('redelegate', async () => {
    expect(await classify('atom', [redelegateMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'redelegate',
    });
  });

  test('withdraw-rewards', async () => {
    expect(await classify('atom', [withdrawRewardsMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'withdraw-rewards',
    });
  });

  test('restake-rewards', async () => {
    expect(await classify('atom', [restakeGrantMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'restake-rewards',
    });
  });

  test('revoke-restake-rewards', async () => {
    expect(await classify('atom', [revokeRestakeMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'revoke-restake-rewards',
    });
  });

  test('stake with restaking turned on — MsgDelegate followed by the grant', async () => {
    expect(await classify('atom', [delegateMsg(), restakeGrantMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'stake-with-restake-rewards',
    });
  });

  test('send, on a chain that exposes it', async () => {
    expect(await classify('cronos', [sendMsg()])).toMatchObject({ status: 'recognized', operation: 'send' });
  });

  test("dYdX's IBC transfer of USDC rewards to Noble", async () => {
    expect(await classify('dydx', [ibcTransferMsg()])).toMatchObject({
      status: 'recognized',
      operation: 'ibc-transfer',
    });
  });
});

describe('Operations Kiln does not craft on a given chain are rejected', () => {
  test('a send on Cosmos Hub, which has no send route', async () => {
    const verdict = await classify('atom', [sendMsg()]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('does not craft a send operation') });
  });

  test('a restake grant on Injective, which has no restake route', async () => {
    const verdict = await classify('injective', [restakeGrantMsg()]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('does not craft a restake-rewards operation') });
  });

  test('an IBC transfer on Cosmos Hub, which has no transfer route', async () => {
    const verdict = await classify('atom', [ibcTransferMsg()]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('does not craft a ibc-transfer operation') });
  });

  test('a stake on Kava, which Kiln Connect no longer serves at all', async () => {
    const verdict = await classify('kava', [delegateMsg()]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('does not craft transactions on this chain') });
  });

  test('a stake on ZetaChain, which Kiln Connect no longer serves at all', async () => {
    expect(await classify('zeta', [delegateMsg()])).toMatchObject({ status: 'unrecognized' });
  });
});

describe('Non-Kiln Cosmos transactions are rejected', () => {
  test('a governance vote', async () => {
    const verdict = await classify('atom', [{ typeUrl: '/cosmos.gov.v1beta1.MsgVote', value: new Uint8Array([9, 9]) }]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('/cosmos.gov.v1beta1.MsgVote') });
  });

  test('a send smuggled alongside a valid delegation', async () => {
    const verdict = await classify('cronos', [delegateMsg(), sendMsg('cosmos1attacker')]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('bundles 2 messages') });
  });

  test('a grant authorizing undelegation rather than delegation', async () => {
    const verdict = await classify('atom', [restakeGrantMsg(AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('undelegate on your behalf') });
  });

  test('a stake whose paired grant authorizes undelegation', async () => {
    const verdict = await classify('atom', [
      delegateMsg(),
      restakeGrantMsg(AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE),
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('undelegate on your behalf') });
  });

  test('a grant of some authorization other than StakeAuthorization', async () => {
    const grant: Any = {
      typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
      value: MsgGrant.encode(
        MsgGrant.fromPartial({
          granter: delegator,
          grantee,
          grant: {
            expiration: { seconds: 1n },
            authorization: {
              typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
              value: new Uint8Array([10, 4, 116, 101, 115, 116]),
            },
          },
        }),
      ).finish(),
    };
    const verdict = await classify('atom', [grant]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('GenericAuthorization') });
  });

  test('a revoke aimed at an authorization Kiln never granted', async () => {
    const verdict = await classify('atom', [revokeRestakeMsg('/cosmos.bank.v1beta1.MsgSend')]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('/cosmos.bank.v1beta1.MsgSend') });
  });

  test('an authz exec, which Kiln never crafts', async () => {
    const exec: Any = {
      typeUrl: '/cosmos.authz.v1beta1.MsgExec',
      value: new Uint8Array([10, 13, 99, 111, 115, 109, 111, 115, 49, 103, 114, 97, 110, 116, 101]),
    };
    const verdict = await classify('atom', [exec]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('authz exec') });
  });

  test('a transaction with no messages at all', async () => {
    const verdict = await classify('atom', []);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('no messages') });
  });
});
