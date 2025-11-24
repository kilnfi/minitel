import type { DecodedTxRaw } from '@cosmjs/proto-signing';
import type { Protocol, ProtocolAdapter } from '@protocols/shared';
import { parseCosmosTx } from './parser';

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

export const createCosmosAdapter = ({
  name,
  displayName,
  protocol,
}: {
  name: string;
  displayName: string;
  protocol: Protocol;
}): ProtocolAdapter<DecodedTxRaw> => {
  return {
    protocol,
    name,
    displayName,
    placeholder: 'Paste your transaction as hex',
    validateInput: isValidCosmosInput,
    convertBigInt: true,
    parseTransaction: async (rawTx) => parseCosmosTx(rawTx),
    computeHash: computeCosmosHash,
  };
};
