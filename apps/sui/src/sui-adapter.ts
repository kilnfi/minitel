import type { Transaction } from '@mysten/sui/transactions';
import { type ProtocolAdapter, SUI } from '@protocols/shared';
import { parseSuiTx } from '@/parser';

const isValidSuiInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;
  return /^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0;
};

const computeSuiHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Sui hash');
  }
};

export const suiAdapter: ProtocolAdapter<ReturnType<typeof Transaction.prototype.getData>> = {
  protocol: SUI,
  name: 'sui',
  displayName: 'Sui',
  placeholder: 'Paste your transaction as hex',
  validateInput: isValidSuiInput,
  parseTransaction: parseSuiTx,
  computeHash: computeSuiHash,
};
