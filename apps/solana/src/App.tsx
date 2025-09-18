import { EthereumIcon, Header, type Protocol, SolanaIcon, TransactionDecoder } from '@protocols/ui';
import { useState } from 'react';
import { cn } from '#/lib/utils';
import { SolanaPlaybook } from '@/components/SolanaPlaybook';
import { Summary } from '@/components/Summary';
import { useTransactionDecoder } from '@/hooks/useTransactionDecoder';
import { useUrlParam } from '@/hooks/useUrlParam';
import type { ParseSolTxResult } from '@/parser';
import { sampleTransaction } from '@/utils';

const protocols: Protocol[] = [
  {
    name: 'Ethereum',
    icon: <EthereumIcon className="size-5" />,
    url: import.meta.env.VITE_ETHEREUM_URL,
  },
  {
    name: 'Solana',
    icon: <SolanaIcon className="size-5" />,
    url: import.meta.env.VITE_SOLANA_URL,
  },
];

const currentProtocol = protocols.find((protocol) => protocol.url === window.location.origin);

function App() {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });
  const { decodedTransaction, warnings, hash, error, decodeTransaction } = useTransactionDecoder();
  const [playground, setPlayground] = useState<boolean>(false);

  const handleDecode = async () => {
    await decodeTransaction(rawTransaction);
  };

  const renderSummary = (data: ParseSolTxResult) => (
    <>
      <Summary instructions={data.instructions} />
    </>
  );

  const togglePlayground = () => {
    setPlayground(!playground);
  };

  return (
    <div className="relative flex">
      <div className={cn('w-full transition-all duration-300 ease-in-out', playground ? 'pr-[40%]' : 'pr-0')}>
        <Header togglePlayground={togglePlayground} protocols={protocols} currentProtocol={currentProtocol} />
        <TransactionDecoder
          title="Solana raw transaction decoder"
          subtitle="Decode and analyze Solana transactions"
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
      <SolanaPlaybook playground={playground} />
    </div>
  );
}

export default App;
