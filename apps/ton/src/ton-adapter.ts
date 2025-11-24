import { type ProtocolAdapter, TON } from '@protocols/shared';
import { Cell } from '@ton/core';
import { parseTonTx } from '@/parser';

const isValidTonInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;

  if (/^(0x)?[0-9a-fA-F]+$/.test(input)) {
    const hex = input.replace(/^0x/, '');
    return hex.length % 2 === 0;
  }

  if (/^[A-Za-z0-9+/]+=*$/.test(input)) return true;

  return false;
};

const computeTonHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const bocBytes = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

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
  displayName: 'The Open Network',
  placeholder: 'Paste your transaction as hex or base64',
  validateInput: isValidTonInput,
  parseTransaction: parseTonTx,
  computeHash: computeTonHash,
};
