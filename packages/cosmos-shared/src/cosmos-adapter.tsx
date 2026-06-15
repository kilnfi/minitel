import type { Protocol, ProtocolAdapter } from '@protocols/shared';
import { CosmosTransactionSummary } from './CosmosTransactionSummary';
import { type CosmosMessage, type CosmosTransaction, parseCosmosTx } from './parser';

const isValidCosmosInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;

  return /^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0;
};

const computeCosmosHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Cosmos hash');
  }
};

const warningsForMessage = (message: CosmosMessage): string[] => {
  switch (message.kind) {
    case 'unsupported':
      return [`🚨 CRITICAL: Unsupported message type detected: ${message.typeUrl || 'unknown'}`];
    case 'send':
      return [`⚠️ Token transfer (MsgSend) detected to ${message.toAddress} — unusual for a staking operation`];
    case 'redelegate':
      return [
        `⚠️ Redelegation detected: moving stake from ${message.validatorSrcAddress} to ${message.validatorDstAddress}`,
      ];
    case 'authzGrant':
      return [
        `🚨 CRITICAL: Authz grant detected — granting ${message.grantee} authorization ${message.authorizationType}`,
      ];
    case 'authzExec':
      return [
        `🚨 CRITICAL: Authz exec detected — ${message.grantee} executing ${message.innerTypeUrls.length} nested message(s)`,
      ];
    case 'authzRevoke':
      return [`⚠️ Authz revoke detected for ${message.grantee} (${message.msgTypeUrl})`];
    default:
      return [];
  }
};

export const createCosmosAdapter = ({
  name,
  displayName,
  protocol,
}: {
  name: string;
  displayName: string;
  protocol: Protocol;
}): ProtocolAdapter<CosmosTransaction> => {
  return {
    protocol,
    name,
    displayName,
    placeholder: 'Paste your transaction as hex',
    validateInput: isValidCosmosInput,
    parseTransaction: async (rawTx) => parseCosmosTx(rawTx),
    computeHash: computeCosmosHash,
    renderSummary: (data) => <CosmosTransactionSummary transaction={data} />,
    generateWarnings: (data) => data.messages.flatMap(warningsForMessage).map((message) => ({ message })),
  };
};
