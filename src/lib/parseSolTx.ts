import { Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";

export const parseSolTx = async (txRaw: string): Promise<object> => {
  const tx = Transaction.from(Buffer.from(txRaw, "hex"));
  return tx;
};
