import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, fromHex } from '@mysten/sui/utils';

const isBase64 = (input: string): boolean => /^[A-Za-z0-9+/]*={0,2}$/.test(input) && input.length % 4 === 0;

export const parseSuiTx = async (rawTxInput: string): Promise<ReturnType<typeof Transaction.prototype.getData>> => {
  const input = rawTxInput.trim();

  let txBytes: Uint8Array;
  if (isBase64(input)) {
    txBytes = fromBase64(input);
  } else {
    const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
    txBytes = fromHex(cleanHex);
  }

  const tx = Transaction.from(txBytes);
  return tx.getData();
};
