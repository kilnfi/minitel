import type { ProtocolAdapter, TransactionVerdict } from '@protocols/shared';
import { useCallback, useState } from 'react';
import { convertBigIntToString } from '../lib/utils';

export type UseTransactionDecoderResult<T> = {
  decodedTransaction: T | null;
  hash: string;
  error?: string;
  verdict: TransactionVerdict | null;
  warnings: Array<{ message: string }>;
  decodeTransaction: (rawTx: string) => Promise<void>;
  isLoading: boolean;
};

export function useTransactionDecoder<T>(adapter: ProtocolAdapter<T>): UseTransactionDecoderResult<T> {
  const [decodedTransaction, setDecodedTransaction] = useState<T | null>(null);
  const [hash, setHash] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const decodeTransaction = useCallback(
    async (rawTx: string) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const decoded = await adapter.parseTransaction(rawTx);
        const computedHash = await adapter.computeHash(rawTx);

        const finalDecoded = adapter.convertBigInt ? convertBigIntToString(decoded) : decoded;
        setDecodedTransaction(finalDecoded);
        setHash(computedHash);
      } catch (err) {
        console.error('Transaction decode error:', err);
        const sanitizedMessage =
          err instanceof Error
            ? 'Failed to decode transaction. Please check the transaction format and try again.'
            : 'An unexpected error occurred while decoding the transaction.';
        setError(sanitizedMessage);
        setDecodedTransaction(null);
        setHash('');
      } finally {
        setIsLoading(false);
      }
    },
    [adapter],
  );

  const warnings = decodedTransaction ? (adapter.generateWarnings?.(decodedTransaction) ?? []) : [];

  // A classifier that throws must not read as "no objection" — fall closed to unrecognized.
  const classify = (data: T): TransactionVerdict => {
    try {
      return adapter.classifyTransaction(data);
    } catch {
      return {
        status: 'unrecognized',
        reason: 'This transaction could not be checked against the operations Kiln produces.',
      };
    }
  };

  const verdict = decodedTransaction ? classify(decodedTransaction) : null;

  return {
    decodedTransaction,
    hash,
    error,
    verdict,
    warnings,
    decodeTransaction,
    isLoading,
  };
}
