import { prettyPrintJson } from "pretty-print-json";
import { Buffer } from "buffer";
import { decodeTxRaw } from "@cosmjs/proto-signing";

export const parseCosmosTx = async (txRaw: string): Promise<string> => {
  const tx = decodeTxRaw(Uint8Array.from(Buffer.from(txRaw, "hex")));
  return prettyPrintJson.toHtml(tx, { quoteKeys: true });
};
