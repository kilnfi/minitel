import { blake2b } from '@noble/hashes/blake2.js';
import { type ProtocolAdapter, XTZ } from '@protocols/shared';
import type { ForgeParams } from '@taquito/local-forging';
import { parseXtzTx } from '@/parser';

export const computeXtzHash = (rawTx: string): string => {
  const forgedBytes = new Uint8Array(rawTx.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []);

  const watermarked = new Uint8Array(forgedBytes.length + 1);
  watermarked[0] = 0x03;
  watermarked.set(forgedBytes, 1);

  const digest = blake2b(watermarked, { dkLen: 32 });

  return Array.from(digest)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const xtzAdapter: ProtocolAdapter<ForgeParams> = {
  protocol: XTZ,
  name: 'xtz',
  displayName: 'Tezos',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseXtzTx,
  computeHash: computeXtzHash,
};
