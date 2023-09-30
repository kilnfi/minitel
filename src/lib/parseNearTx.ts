import { prettyPrintJson } from "pretty-print-json";
import { transactions } from "near-api-js";
import { Buffer } from "buffer";

export const parseNearTx = async (txRaw: string): Promise<string> => {
  const tx = transactions.Transaction.decode(Buffer.from(txRaw, "hex"));
  return prettyPrintJson.toHtml(tx, { quoteKeys: true });
};
