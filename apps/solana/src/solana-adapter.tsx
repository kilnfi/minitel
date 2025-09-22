import type { ProtocolAdapter } from '@protocols/shared';
import { Summary } from '@/components/Summary';
import { type ParseSolTxResult, parseSolTx } from '@/parser';
import type { DecodedInstruction } from '@/types';

const computeSolanaHash = async (rawTx: string): Promise<string> => {
  try {
    const transactionUint8Array = new Uint8Array(rawTx.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (_error) {
    return '';
  }
};

export const solanaAdapter: ProtocolAdapter<ParseSolTxResult> = {
  name: 'solana',
  displayName: 'Solana',
  placeholder: 'Paste your transaction as hex or Fireblocks message JSON',

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
