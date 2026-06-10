import { type DecodedTxRaw, decodeTxRaw } from '@cosmjs/proto-signing';
import { MsgExec, MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import type { Any } from 'cosmjs-types/google/protobuf/any';

/** A normalized coin amount, always rendered as decimal strings (never bigint). */
export type CosmosCoin = {
  denom: string;
  amount: string;
};

/**
 * Each entry in a `TxBody.messages` array decoded from its protobuf `Any`
 * into a concrete, human-readable message. Unknown `typeUrl`s fail closed as
 * `unsupported` so they are never silently presented as benign.
 */
export type CosmosMessage =
  | {
      kind: 'delegate' | 'undelegate';
      typeUrl: string;
      delegatorAddress: string;
      validatorAddress: string;
      amount: CosmosCoin | null;
    }
  | {
      kind: 'redelegate';
      typeUrl: string;
      delegatorAddress: string;
      validatorSrcAddress: string;
      validatorDstAddress: string;
      amount: CosmosCoin | null;
    }
  | {
      kind: 'withdrawRewards';
      typeUrl: string;
      delegatorAddress: string;
      validatorAddress: string;
    }
  | {
      kind: 'send';
      typeUrl: string;
      fromAddress: string;
      toAddress: string;
      amount: CosmosCoin[];
    }
  | {
      kind: 'authzGrant';
      typeUrl: string;
      granter: string;
      grantee: string;
      authorizationType: string;
    }
  | {
      kind: 'authzExec';
      typeUrl: string;
      grantee: string;
      innerTypeUrls: string[];
    }
  | {
      kind: 'authzRevoke';
      typeUrl: string;
      granter: string;
      grantee: string;
      msgTypeUrl: string;
    }
  | {
      kind: 'unsupported';
      typeUrl: string;
      raw: string;
    };

export type CosmosFee = {
  amount: CosmosCoin[];
  gasLimit: string;
  payer: string;
  granter: string;
};

export type CosmosTransaction = {
  messages: CosmosMessage[];
  memo: string;
  fee: CosmosFee | null;
};

// Type URLs we know how to decode. Anything else is reported as `unsupported`.
const TYPE_URLS = {
  delegate: '/cosmos.staking.v1beta1.MsgDelegate',
  undelegate: '/cosmos.staking.v1beta1.MsgUndelegate',
  beginRedelegate: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  withdrawRewards: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  send: '/cosmos.bank.v1beta1.MsgSend',
  authzGrant: '/cosmos.authz.v1beta1.MsgGrant',
  authzExec: '/cosmos.authz.v1beta1.MsgExec',
  authzRevoke: '/cosmos.authz.v1beta1.MsgRevoke',
} as const;

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const toCoin = (coin: { denom: string; amount: string } | undefined | null): CosmosCoin | null =>
  coin ? { denom: coin.denom, amount: coin.amount } : null;

const toCoins = (coins: ReadonlyArray<{ denom: string; amount: string }>): CosmosCoin[] =>
  coins.map((coin) => ({ denom: coin.denom, amount: coin.amount }));

/**
 * Decode a single protobuf `Any` message body by its `typeUrl`. All values are
 * derived from the raw bytes (`message.value`) — never from any envelope-level
 * hint — so a mismatched/forged `typeUrl` cannot misrepresent the payload.
 */
const decodeMessage = (message: Any): CosmosMessage => {
  const { typeUrl, value } = message;

  try {
    switch (typeUrl) {
      case TYPE_URLS.delegate: {
        const msg = MsgDelegate.decode(value);
        return {
          kind: 'delegate',
          typeUrl,
          delegatorAddress: msg.delegatorAddress,
          validatorAddress: msg.validatorAddress,
          amount: toCoin(msg.amount),
        };
      }
      case TYPE_URLS.undelegate: {
        const msg = MsgUndelegate.decode(value);
        return {
          kind: 'undelegate',
          typeUrl,
          delegatorAddress: msg.delegatorAddress,
          validatorAddress: msg.validatorAddress,
          amount: toCoin(msg.amount),
        };
      }
      case TYPE_URLS.beginRedelegate: {
        const msg = MsgBeginRedelegate.decode(value);
        return {
          kind: 'redelegate',
          typeUrl,
          delegatorAddress: msg.delegatorAddress,
          validatorSrcAddress: msg.validatorSrcAddress,
          validatorDstAddress: msg.validatorDstAddress,
          amount: toCoin(msg.amount),
        };
      }
      case TYPE_URLS.withdrawRewards: {
        const msg = MsgWithdrawDelegatorReward.decode(value);
        return {
          kind: 'withdrawRewards',
          typeUrl,
          delegatorAddress: msg.delegatorAddress,
          validatorAddress: msg.validatorAddress,
        };
      }
      case TYPE_URLS.send: {
        const msg = MsgSend.decode(value);
        return {
          kind: 'send',
          typeUrl,
          fromAddress: msg.fromAddress,
          toAddress: msg.toAddress,
          amount: toCoins(msg.amount),
        };
      }
      case TYPE_URLS.authzGrant: {
        const msg = MsgGrant.decode(value);
        return {
          kind: 'authzGrant',
          typeUrl,
          granter: msg.granter,
          grantee: msg.grantee,
          authorizationType: msg.grant?.authorization?.typeUrl ?? 'unknown',
        };
      }
      case TYPE_URLS.authzExec: {
        const msg = MsgExec.decode(value);
        return {
          kind: 'authzExec',
          typeUrl,
          grantee: msg.grantee,
          innerTypeUrls: msg.msgs.map((inner) => inner.typeUrl),
        };
      }
      case TYPE_URLS.authzRevoke: {
        const msg = MsgRevoke.decode(value);
        return {
          kind: 'authzRevoke',
          typeUrl,
          granter: msg.granter,
          grantee: msg.grantee,
          msgTypeUrl: msg.msgTypeUrl,
        };
      }
      default:
        // Fail closed: an unknown type is surfaced explicitly, never as benign.
        return {
          kind: 'unsupported',
          typeUrl,
          raw: bytesToHex(value),
        };
    }
  } catch {
    // A declared type whose bytes don't actually decode is also untrustworthy.
    return {
      kind: 'unsupported',
      typeUrl,
      raw: bytesToHex(value),
    };
  }
};

const decodeFee = (tx: DecodedTxRaw): CosmosFee | null => {
  const fee = tx.authInfo.fee;
  if (!fee) return null;
  return {
    amount: toCoins(fee.amount),
    gasLimit: fee.gasLimit.toString(),
    payer: fee.payer,
    granter: fee.granter,
  };
};

export const parseCosmosTx = async (txRaw: string): Promise<CosmosTransaction> => {
  const bytes = new Uint8Array(txRaw.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
  const tx = decodeTxRaw(bytes);

  return {
    messages: tx.body.messages.map(decodeMessage),
    memo: tx.body.memo,
    fee: decodeFee(tx),
  };
};
