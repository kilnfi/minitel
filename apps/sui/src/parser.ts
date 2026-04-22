import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, fromHex } from '@mysten/sui/utils';

const isHex = (input: string): boolean => {
  const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
  return /^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0;
};

const isBase64 = (input: string): boolean => /^[A-Za-z0-9+/]*={0,2}$/.test(input) && input.length % 4 === 0;

export const parseSuiTx = async (rawTxInput: string): Promise<ReturnType<typeof Transaction.prototype.getData>> => {
  const input = rawTxInput.trim();

  let txBytes: Uint8Array;
  if (isHex(input)) {
    const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
    txBytes = fromHex(cleanHex);
  } else if (isBase64(input)) {
    txBytes = fromBase64(input);
  } else {
    throw new Error('Invalid input format');
  }

  const tx = Transaction.from(txBytes);
  return tx.getData();
};
