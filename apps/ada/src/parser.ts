import type { TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { Transaction, TransactionBody } from '@emurgo/cardano-serialization-lib-browser';

/** `to_js_value()` omits the withdrawals map, so a reward withdrawal decoded as doing nothing. */
const toJson = (value: { to_json: () => string }): TransactionJSON => JSON.parse(value.to_json());

export const parseAdaTx = async (txRaw: string): Promise<TransactionJSON> => {
  try {
    // First try to parse as complete transaction
    try {
      return toJson(Transaction.from_hex(txRaw));
    } catch {
      const txBody = TransactionBody.from_hex(txRaw);

      return {
        body: JSON.parse(txBody.to_json()),
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
