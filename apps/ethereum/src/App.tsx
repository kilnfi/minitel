import { getCurrentProtocol, protocols } from '@protocols/shared';
import { Background, Header, type Protocol, TransactionDecoder } from '@protocols/ui';
import { useState } from 'react';
import { formatEther } from 'viem';
import { TransactionSummary } from '@/components/TransactionSummary';
import { useUrlParam } from '@/hooks/useUrlParam';
import { hashEthTx, parseEthTx } from '@/parser';
import type { AugmentedTransaction } from '@/utils';
import { getActionDescription, sampleTransaction } from '@/utils';

const currentProtocol = getCurrentProtocol();

function App() {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });
  const [decodedTransaction, setDecodedTransaction] = useState<AugmentedTransaction | null>(null);
  const [hash, setHash] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleDecode = async () => {
    try {
      setError(undefined);
      const decoded_tx = await parseEthTx(rawTransaction);
      const hashHex = hashEthTx(rawTransaction);
      setHash(hashHex);
      setDecodedTransaction(decoded_tx);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setDecodedTransaction(null);
    }
  };

  const renderSummary = (data: AugmentedTransaction) => <TransactionSummary transaction={data} hash={hash} />;

  const valueWei = decodedTransaction?.value ?? 0n;
  const ethAmount = formatEther(valueWei);
  const isHighValue = Number(ethAmount) > 1;
  const highValueWarning = isHighValue ? `High value transaction: ${ethAmount} ETH` : '';

  const warnings = decodedTransaction
    ? [{ message: getActionDescription(decodedTransaction).warning }, { message: highValueWarning }]
    : [];

  const onChangeProtocol = (protocol: Protocol) => {
    const protocolUrl = import.meta.env.DEV ? protocol.localUrl : protocol.url;
    window.open(protocolUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Background />
      <Header protocols={protocols} currentProtocol={currentProtocol} onChangeProtocol={onChangeProtocol} />
      <TransactionDecoder
        title="Ethereum raw transaction decoder"
        subtitle="Decode and analyze ethereum transactions"
        rawTransaction={rawTransaction}
        onRawTransactionChange={setRawTransaction}
        onDecode={handleDecode}
        decodedTransaction={decodedTransaction}
        hash={hash}
        sampleTransaction={sampleTransaction}
        warnings={warnings}
        renderSummary={renderSummary}
        placeholder="Paste your transaction as hex or Fireblocks message JSON"
        error={error}
      />
    </div>
  );
}

export default App;

// const stakeTransaction = {
//   to: '0xCA8F5dbC4c90678763B291217e6ddDfcA00341d0' as `0x${string}`,
//   nonce: 1,
//   maxPriorityFeePerGas: 2000000000n, // 2 Gwei
//   maxFeePerGas: 383687469748n,
//   gas: 692134n,
//   value: 0n,
//   data: '0x6e553f650000000000000000000000000000000000000000000000000000000000000005000000000000000000000000ca5c9efb78f0d608f9562c0ae5352a61e417ee2d' as `0x${string}`,
//   chainId: 42161,
//   authorizationList: [],
// } as TransactionSerializable;

// const serializedTransaction = serializeTransaction({
//   ...stakeTransaction,
// });

// console.log(serializedTransaction);
