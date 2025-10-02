import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

export const parseSuiTx = async (rawTxHex: string): Promise<ReturnType<typeof Transaction.prototype.getData>> => {
  const cleanHex = rawTxHex.startsWith('0x') ? rawTxHex.slice(2) : rawTxHex;
  const txBytes = fromHex(cleanHex);

  const tx = Transaction.from(txBytes);
  return tx.getData();
};
