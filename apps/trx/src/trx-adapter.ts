import type { ProtocolAdapter } from '@protocols/shared';
import { parseTrxTx } from '@/parser';

const computeTrxHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Trx hash');
  }
};

export const trxAdapter: ProtocolAdapter<unknown> = {
  name: 'trx',
  displayName: 'Trx',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseTrxTx,
  computeHash: computeTrxHash,
};
