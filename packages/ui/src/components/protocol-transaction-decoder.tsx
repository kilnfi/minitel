import type { ProtocolAdapter } from '@protocols/shared';
import { TransactionDecoder } from '#/components/transaction-decoder';
import { useTransactionDecoder } from '#/hooks/useTransactionDecoder';
import { useUrlParam } from '#/hooks/useUrlParam';

interface ProtocolTransactionDecoderProps<T> {
  adapter: ProtocolAdapter<T>;
}

export function ProtocolTransactionDecoder<T>({ adapter }: ProtocolTransactionDecoderProps<T>) {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });

  const { decodedTransaction, hash, error, warnings, decodeTransaction } = useTransactionDecoder(adapter);

  const handleDecode = async () => {
    await decodeTransaction(rawTransaction);
  };

  return (
    <TransactionDecoder
      title={`${adapter.displayName} Transaction Decoder`}
      subtitle={`Decode and analyze ${adapter.displayName} transactions`}
      rawTransaction={rawTransaction}
      onRawTransactionChange={setRawTransaction}
      onDecode={handleDecode}
      decodedTransaction={decodedTransaction}
      hash={hash}
      warnings={warnings}
      renderSummary={(data: T) => adapter.renderSummary(data, hash)}
      placeholder={adapter.placeholder ?? 'Paste your transaction'}
      error={error}
    />
  );
}
