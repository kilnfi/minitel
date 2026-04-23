import type { Transaction } from '@mysten/sui/transactions';
import { fromBase64, fromHex } from '@mysten/sui/utils';
import { blake2b } from '@noble/hashes/blake2.js';
import { type ProtocolAdapter, SUI } from '@protocols/shared';
import { parseSuiTx } from '@/parser';

const isHex = (input: string): boolean => {
  const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
  return /^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0;
};

const isBase64 = (input: string): boolean => /^[A-Za-z0-9+/]*={0,2}$/.test(input) && input.length % 4 === 0;

const isValidSuiInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;
  if (isHex(input)) return true;
  if (isBase64(input)) return true;
  return false;
};

/**
 * Computes the Sui transaction intent message hash exactly as Fireblocks does:
 *   hex( blake2b256( [IntentScope, Version, AppId] || bcs_bytes ) )
 *
 * Accepts both hex and base64 encoded BCS transaction bytes.
 */
const computeSuiHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    let txBytes: Uint8Array;
    if (isHex(input)) {
      const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
      txBytes = fromHex(cleanHex);
    } else if (isBase64(input)) {
      txBytes = fromBase64(input);
    } else {
      throw new Error('Invalid input format');
    }

    // Fireblocks signs the Blake2b-256 hash of the "Intent Message":
    // [IntentScope (0), Version (0), AppId (0)] || BCS transaction bytes
    const intentBytes = new Uint8Array(3 + txBytes.length);
    intentBytes.set([0, 0, 0]); // TransactionData, V0, Sui
    intentBytes.set(txBytes, 3);

    const hashBuffer = blake2b(intentBytes, { dkLen: 32 });

    return Array.from(hashBuffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    throw new Error('Failed to compute Sui hash');
  }
};

export const suiAdapter: ProtocolAdapter<ReturnType<typeof Transaction.prototype.getData>> = {
  protocol: SUI,
  name: 'sui',
  displayName: 'Sui',
  placeholder: 'Paste your transaction as hex or base64',
  validateInput: isValidSuiInput,
  parseTransaction: parseSuiTx,
  computeHash: computeSuiHash,
};
