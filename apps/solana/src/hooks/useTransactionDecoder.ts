import { useState } from 'react';
import { type ParseSolTxResult, parseSolTx } from '@/parser';
import type { DecodedInstruction } from '@/types';

export type DecodedTransactionResult = {
  decodedTransaction: ParseSolTxResult | null;
  hash: string;
  error?: string;
  warnings: Array<{ message: string }>;
};

export const useTransactionDecoder = () => {
  const [decodedResult, setDecodedResult] = useState<DecodedTransactionResult>({
    decodedTransaction: null,
    hash: '',
    error: undefined,
    warnings: [],
  });

  const decodeTransaction = async (rawTransaction: string) => {
    try {
      const decoded_tx = parseSolTx(rawTransaction);

      const transactionUint8Array = new Uint8Array(
        rawTransaction.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
      );
      const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const warnings = decoded_tx.instructions
        .filter((instruction: DecodedInstruction) => instruction.warning)
        .map((instruction: DecodedInstruction) => ({
          message: instruction.warning?.replace('⚠️ ', '') || '',
        }));

      setDecodedResult({
        decodedTransaction: decoded_tx,
        hash: hashHex,
        error: undefined,
        warnings,
      });

      return decoded_tx;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDecodedResult({
        decodedTransaction: null,
        hash: '',
        error: errorMessage,
        warnings: [],
      });
      throw error;
    }
  };

  return {
    ...decodedResult,
    decodeTransaction,
  };
};
