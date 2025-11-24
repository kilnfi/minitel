import type { ProtocolAdapter } from '@protocols/shared';
import { useCallback, useState } from 'react';
import { convertBigIntToString } from '../lib/utils';

export type UseTransactionDecoderResult<T> = {
  decodedTransaction: T | null;
  hash: string;
  error?: string;
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
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDecodedTransaction(null);
        setHash('');
      } finally {
        setIsLoading(false);
      }
    },
    [adapter],
  );

  const warnings = decodedTransaction ? (adapter.generateWarnings?.(decodedTransaction) ?? []) : [];

  return {
    decodedTransaction,
    hash,
    error,
    warnings,
    decodeTransaction,
    isLoading,
  };
}
