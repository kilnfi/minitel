import type { ForgeParams } from '@taquito/local-forging';
import { localForger } from '@taquito/local-forging';

export const parseXtzTx = async (txRaw: string): Promise<ForgeParams> => {
  const parsed = await localForger.parse(txRaw);
  return parsed;
};
