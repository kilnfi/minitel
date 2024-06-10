import { localForger } from "@taquito/local-forging";

export const parseXtzTx = async (txRaw: string): Promise<object> => {
  const hex = txRaw.startsWith("0x") ? txRaw.substring(2) : txRaw;
  const tx = await localForger.parse(hex);
  return tx;
};
