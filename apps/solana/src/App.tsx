import { getCurrentProtocol, protocols } from '@protocols/shared';
import { Background, Header, type Protocol, TransactionDecoder } from '@protocols/ui';
import { useState } from 'react';
import { cn } from '#/lib/utils';
import { SolanaPlaybook } from '@/components/SolanaPlaybook';
import { Summary } from '@/components/Summary';
import { useTransactionDecoder } from '@/hooks/useTransactionDecoder';
import { useUrlParam } from '@/hooks/useUrlParam';
import type { ParseSolTxResult } from '@/parser';
import { sampleTransaction } from '@/utils';

const currentProtocol = getCurrentProtocol();

function App() {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });
  const { decodedTransaction, warnings, hash, error, decodeTransaction } = useTransactionDecoder();
  const [playbook, setPlaybook] = useState<boolean>(false);

  const handleDecode = async () => {
    await decodeTransaction(rawTransaction);
  };

  const renderSummary = (data: ParseSolTxResult) => (
    <>
      <Summary instructions={data.instructions} />
    </>
  );

  const togglePlaybook = () => {
    setPlaybook(!playbook);
  };

  const onChangeProtocol = (protocol: Protocol) => {
    const protocolUrl = import.meta.env.DEV ? protocol.localUrl : protocol.url;
    window.open(protocolUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex min-h-screen">
      <div className={cn('relative w-full transition-all duration-300 ease-in-out', playbook ? 'md:mr-[40%] mr-0' : 'pr-0')}>
        <Background />
        <Header
          protocols={protocols}
          currentProtocol={currentProtocol}
          onChangeProtocol={onChangeProtocol}
          togglePlaybook={togglePlaybook}
          isPlaybookOpen={playbook}
        />
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
      <SolanaPlaybook isOpen={playbook} onClose={() => setPlaybook(false)} />
    </div>
  );
}

export default App;
