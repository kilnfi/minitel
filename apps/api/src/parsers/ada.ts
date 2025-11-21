// FIXED: Using Node.js version instead of browser version
import type { TransactionJSON } from '@emurgo/cardano-serialization-lib-nodejs';
import { Transaction, TransactionBody } from '@emurgo/cardano-serialization-lib-nodejs';

export const parseAdaTx = async (txRaw: string): Promise<TransactionJSON> => {
  try {
    // First try to parse as complete transaction
    try {
      const tx = Transaction.from_hex(txRaw);
      return tx.to_js_value();
    } catch {
      const txBody = TransactionBody.from_hex(txRaw);
      const bodyJson = txBody.to_js_value();

      return {
        body: bodyJson,
        witness_set: {
          vkeys: [],
        },
        is_valid: true,
      } as TransactionJSON;
    }
  } catch (_error) {
    throw new Error('Failed to parse Ada transaction');
  }
};
