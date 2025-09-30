import type { DecodedTxRaw } from '@cosmjs/proto-signing';
import type { ProtocolAdapter } from '@protocols/shared';
import { parseCosmosTx } from '@/parser';

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

export const cosmosAdapter: ProtocolAdapter<DecodedTxRaw> = {
  name: 'cosmos',
  displayName: 'Cosmos',
  placeholder: 'Paste your transaction as hex',

  parseTransaction: async (rawTx) => parseCosmosTx(rawTx),
  computeHash: computeCosmosHash,
};
