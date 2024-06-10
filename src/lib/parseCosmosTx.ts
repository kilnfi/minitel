import { decodeTxRaw } from "@cosmjs/proto-signing";
import { Buffer } from "buffer";

export const parseCosmosTx = async (txRaw: string): Promise<object> => {
  const tx = decodeTxRaw(Uint8Array.from(Buffer.from(txRaw, "hex")));
  return tx;
};
