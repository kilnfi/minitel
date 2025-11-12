import type { ProtocolAdapter } from '@protocols/shared';
import { useMemo, useState } from 'react';
import { useTransactionDecoder } from '../hooks/useTransactionDecoder';
import { useUrlParam } from '../hooks/useUrlParam';
import { TransactionDecoder } from './transaction-decoder';

type ProtocolTransactionDecoderProps<T> = {
  adapter: ProtocolAdapter<T>;
};

export function ProtocolTransactionDecoder<T>({ adapter }: ProtocolTransactionDecoderProps<T>) {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });

  const initialManualFields = useMemo(() => {
    if (!adapter.manualInputFields) return {};
    return adapter.manualInputFields.reduce(
      (acc, field) => {
        acc[field.key] = '';
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [adapter.manualInputFields]);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualFields, setManualFields] = useState<Record<string, string>>(initialManualFields);

  const { decodedTransaction, hash, error, warnings, decodeTransaction } = useTransactionDecoder(adapter);

  const handleManualFieldChange = (field: string, value: string) => {
    setManualFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleDecode = async () => {
    let txToProcess = rawTransaction;

    if (isManualMode && adapter.buildTransactionFromFields) {
      txToProcess = adapter.buildTransactionFromFields(manualFields);
    }

    await decodeTransaction(txToProcess);
  };

  return (
    <TransactionDecoder
      protocol={adapter.protocol}
      title={`${adapter.displayName} Transaction Decoder`}
      subtitle={`Decode and analyze ${adapter.displayName} transactions`}
      rawTransaction={rawTransaction}
      onRawTransactionChange={setRawTransaction}
      onDecode={handleDecode}
      decodedTransaction={decodedTransaction}
      hash={hash}
      warnings={warnings}
      renderSummary={adapter.renderSummary ? (data: T) => adapter.renderSummary?.(data, hash) : undefined}
      placeholder={adapter.placeholder ?? 'Paste your transaction'}
      error={error}
      validateInput={adapter.validateInput}
      isManualMode={isManualMode}
      onManualModeChange={setIsManualMode}
      manualFields={manualFields}
      manualInputFieldsConfig={adapter.manualInputFields}
      onManualFieldChange={handleManualFieldChange}
    />
  );
}
