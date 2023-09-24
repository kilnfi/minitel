import { prettyPrintJson } from "pretty-print-json";
import { Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";

export const parseSolTx = async (txRaw: string): Promise<string> => {
  const tx = Transaction.from(Buffer.from(txRaw, "hex"));

  return prettyPrintJson.toHtml(tx, {
    quoteKeys: true,
  })
}