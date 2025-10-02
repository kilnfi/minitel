import type { ProtocolAdapter } from '@protocols/shared';
import type { ForgeParams } from '@taquito/local-forging';
import { parseXtzTx } from '@/parser';

const computeXtzHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Xtz hash');
  }
};

export const xtzAdapter: ProtocolAdapter<ForgeParams> = {
  name: 'xtz',
  displayName: 'Xtz',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseXtzTx,
  computeHash: computeXtzHash,
};
