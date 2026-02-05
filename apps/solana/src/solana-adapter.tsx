import { type ProtocolAdapter, SOL } from '@protocols/shared';
import { Transaction } from '@solana/web3.js';
import { Summary } from '@/components/Summary';
import { convertToMessage, looksLikeMessage, type MessageLike, type ParseSolTxResult, parseSolTx } from '@/parser';
import type { DecodedInstruction } from '@/types';
import { base64ToHex, isBase64, isHex } from '@/utils';

const sha256 = async (data: Uint8Array): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as BufferSource);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const computeSolanaHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    // If input is a JSON message
    if (input.startsWith('{') || input.startsWith('[')) {
      const obj = JSON.parse(input);
      const msg = (obj.message ?? obj) as MessageLike;
      if (looksLikeMessage(msg)) {
        const message = convertToMessage(msg);
        return sha256(new Uint8Array(message.serialize()));
      }
    }

    // Hex or base64 path
    let hexInput = input;
    if (!isHex(input) && isBase64(input)) {
      hexInput = base64ToHex(input);
    }

    const tx = Transaction.from(Buffer.from(hexInput, 'hex'));
    return sha256(new Uint8Array(tx.serializeMessage()));
  } catch {
    throw new Error('Failed to compute Solana hash');
  }
};

const isValidSolanaInput = (rawTx: string): boolean => {
  const input = rawTx.trim();
  if (!input) return false;

  // JSON
  if (input.startsWith('{') || input.startsWith('[')) return true;

  // Hex
  if (isHex(input)) return true;

  // Base64
  if (isBase64(input)) return true;

  return false;
};

export const solanaAdapter: ProtocolAdapter<ParseSolTxResult> = {
  protocol: SOL,
  name: 'solana',
  displayName: 'Solana',
  placeholder: 'Paste your transaction as hex, base64, or Fireblocks message JSON',

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
