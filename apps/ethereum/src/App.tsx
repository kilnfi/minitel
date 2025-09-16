import { TransactionDecoder } from '@protocols/ui';
import { useState } from 'react';
import { formatEther } from 'viem';
import { TransactionSummary } from '@/components/TransactionSummary';
import { useUrlParam } from '@/hooks/useUrlParam';
import { hashEthTx, parseEthTx } from '@/parser';
import type { AugmentedTransaction } from '@/utils';
import { getActionDescription, sampleTransaction } from '@/utils';

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

  return (
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
  );
}

export default App;

// const stakeTransaction = {
//   to: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' as `0x${string}`,
//   nonce: 1,
//   maxPriorityFeePerGas: 2000000000n, // 2 Gwei
//   maxFeePerGas: 383687469748n,
//   gas: 140244n,
//   value: 32000000000000000000n, // 32 ETH
//   data: '0xca0bfcce0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000309696c02ec4dbb99f714e26ff1acdf6b258d36dcbad7b8b549553bc99b94ea639cd247f31683564995afd48568c1b6edd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020010000000000000000000000bc86717bad3f8ccf86d2882a6bc351c94580a994000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060a3869da2ed5cc558f016d59fc5ceb0cac28e58743836aa3cf146221f1ef0b959e3cc5c589e05e171f1473596aadf36411767ad92edaae421ba0291bd7568267b3faabc3ab6ed9ddfc048ea6640370977f16f4f626a0e567a11ba25acdc520bb000000000000000000000000000000000000000000000000000000000000000012dd65914dda46639df6344701de54ac3ebe34a4b230262d3017fcd6c29954452' as `0x${string}`,
//   chainId: 1,
// };

// const serializedTransaction = serializeTransaction({
//   ...stakeTransaction,
//   authorizationList: [],
// });
