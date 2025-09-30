import { Buffer } from 'node:buffer';
import { type DecodedTxRaw, decodeTxRaw } from '@cosmjs/proto-signing';

export const parseCosmosTx = async (txRaw: string): Promise<DecodedTxRaw> => {
  const tx = decodeTxRaw(Uint8Array.from(Buffer.from(txRaw, 'hex')));
  return tx;
};
