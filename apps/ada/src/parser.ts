import type { TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { Transaction } from '@emurgo/cardano-serialization-lib-browser';

export const parseAdaTx = async (txRaw: string): Promise<TransactionJSON> => {
  try {
    const tx = Transaction.from_hex(txRaw);
    return tx.to_js_value();
  } catch (_error) {
    throw new Error('Failed to parse Ada transaction');
  }
};
