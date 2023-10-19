import { prettyPrintJson } from "pretty-print-json";
import { Buffer } from "buffer";

export const parseDotTx = async (txRaw: string): Promise<string> => {
  const tx = JSON.parse(Buffer.from(txRaw, "hex").toString());
  return prettyPrintJson.toHtml(tx, { quoteKeys: true });
};
