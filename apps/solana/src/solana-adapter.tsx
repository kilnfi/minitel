import { type ProtocolAdapter, SOL } from '@protocols/shared';
import { Summary } from '@/components/Summary';
import { convertToMessage, looksLikeMessage, type MessageLike, type ParseSolTxResult, parseSolTx } from '@/parser';
import type { DecodedInstruction } from '@/types';

const computeSolanaHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    // If input is a JSON message
    if (input.startsWith('{') || input.startsWith('[')) {
      try {
        const obj = JSON.parse(input);
        const msg = (obj.message ?? obj) as MessageLike;
        if (looksLikeMessage(msg)) {
          const message = convertToMessage(msg);
          const messageBytes = message.serialize();
          const hexString = messageBytes.toString('hex');

          const transactionUint8Array = new Uint8Array(
            hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
          );
          const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        }
      } catch {}
    }

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Solana hash');
  }
};

const isValidSolanaInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;

  if (input.startsWith('{') || input.startsWith('[')) return true;

  return /^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0;
};

export const solanaAdapter: ProtocolAdapter<ParseSolTxResult> = {
  protocol: SOL,
  name: 'solana',
  displayName: 'Solana',
  placeholder: 'Paste your transaction as hex or Fireblocks message JSON',

  validateInput: isValidSolanaInput,
  parseTransaction: async (rawTx) => parseSolTx(rawTx),
  computeHash: computeSolanaHash,

  renderSummary: (data) => <Summary instructions={data.instructions} />,

  generateWarnings: (data) => {
    return data.instructions
      .filter((instruction: DecodedInstruction) => instruction.warning)
      .map((instruction: DecodedInstruction) => ({
        message: instruction.warning?.replace('⚠️ ', '') || '',
      }));
  },
};
