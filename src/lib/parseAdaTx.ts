import { Transaction } from "@emurgo/cardano-serialization-lib-nodejs";

export const parseAdaTx = async (txRaw: string): Promise<object> => {
  const tx = Transaction.from_hex(txRaw);
  return tx.to_js_value();
};
