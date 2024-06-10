import { Buffer } from "buffer";

export const parseDotTx = async (txRaw: string): Promise<object> => {
  const tx = JSON.parse(Buffer.from(txRaw, "hex").toString());
  return tx;
};
