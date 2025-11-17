import type { TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { Transaction, TransactionBody } from '@emurgo/cardano-serialization-lib-browser';
import { blake2b } from '@noble/hashes/blake2.js';
import { ADA, type ProtocolAdapter } from '@protocols/shared';
import { parseAdaTx } from '@/parser';

const computeAdaHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    try {
      const tx = Transaction.from_hex(input);
      const tx_body_bytes = tx.body().to_bytes();
      const hash = blake2b(tx_body_bytes, { dkLen: 32 });
      return Array.from(hash)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      const txBody = TransactionBody.from_hex(input);
      const bodyBytes = txBody.to_bytes();
      const hash = blake2b(bodyBytes, { dkLen: 32 });
      return Array.from(hash)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    throw new Error('Failed to compute Ada hash');
  }
};

export const adaAdapter: ProtocolAdapter<TransactionJSON> = {
  protocol: ADA,
  name: 'ada',
  displayName: 'Cardano',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseAdaTx,
  computeHash: computeAdaHash,
};
