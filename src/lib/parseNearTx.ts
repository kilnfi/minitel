import { Buffer } from "buffer";
import { transactions } from "near-api-js";

export const parseNearTx = async (txRaw: string): Promise<object> => {
  const tx = transactions.Transaction.decode(Buffer.from(txRaw, "hex"));
  return tx;
};
