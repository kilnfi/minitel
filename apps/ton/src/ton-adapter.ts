import { type ProtocolAdapter, TON } from '@protocols/shared';
import { Cell } from '@ton/core';
import { parseTonTx } from '@/parser';

const computeTonHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    // Convert hex string to Uint8Array
    const bocBytes = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

    // Parse the BOC (Bag of Cells) and compute TON cell hash
    const cell = Cell.fromBoc(Buffer.from(bocBytes))[0];
    const cellHash = cell.hash();

    return Buffer.from(cellHash).toString('hex');
  } catch (error) {
    console.error('Failed to compute TON hash:', error);
    throw new Error('Failed to compute Ton hash');
  }
};

export const tonAdapter: ProtocolAdapter<any> = {
  protocol: TON,
  name: 'ton',
  displayName: 'Ton',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseTonTx,
  computeHash: computeTonHash,
};
