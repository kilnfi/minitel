import { type DecodedTxRaw, decodeTxRaw } from '@cosmjs/proto-signing';

export const parseCosmosTx = async (txRaw: string): Promise<DecodedTxRaw> => {
  const bytes = new Uint8Array(txRaw.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
  const tx = decodeTxRaw(bytes);
  return tx;
};
