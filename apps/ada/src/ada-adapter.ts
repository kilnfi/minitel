import type { TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { ADA, type ProtocolAdapter } from '@protocols/shared';
import { parseAdaTx } from '@/parser';

const computeAdaHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Ada hash');
  }
};

export const adaAdapter: ProtocolAdapter<TransactionJSON> = {
  protocol: ADA,
  name: 'ada',
  displayName: 'Ada',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseAdaTx,
  computeHash: computeAdaHash,
};
