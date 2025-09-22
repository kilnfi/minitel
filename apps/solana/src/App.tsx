import { getCurrentProtocol, protocols } from '@protocols/shared';
import { Background, cn, Header, type Protocol, ProtocolTransactionDecoder, TransactionPlaybook } from '@protocols/ui';
import { useState } from 'react';
import { SOLANA_PLAYBOOK_OPERATIONS } from '@/config/playbook-operations';
import { solanaAdapter } from '@/solana-adapter';

const currentProtocol = getCurrentProtocol();

function App() {
  const [playbook, setPlaybook] = useState<boolean>(false);

  const togglePlaybook = () => {
    setPlaybook(!playbook);
  };

  const onChangeProtocol = (protocol: Protocol) => {
    const protocolUrl = import.meta.env.DEV ? protocol.localUrl : protocol.url;
    window.open(protocolUrl, '_blank', 'noopener,noreferrer');
  };

  const playbookConfig = {
    protocolName: 'Solana',
    operations: SOLANA_PLAYBOOK_OPERATIONS,
    adapter: solanaAdapter,
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="flex">
        <div
          className={cn(
            'relative w-full transition-all duration-300 ease-in-out',
            playbook ? 'md:mr-[40%] mr-0' : 'pr-0',
          )}
        >
          <Background />
          <Header
            protocols={protocols}
            currentProtocol={currentProtocol}
            onChangeProtocol={onChangeProtocol}
            togglePlaybook={togglePlaybook}
            isPlaybookOpen={playbook}
          />
          <ProtocolTransactionDecoder adapter={solanaAdapter} />
        </div>
        <TransactionPlaybook config={playbookConfig} isOpen={playbook} onClose={() => setPlaybook(false)} />
      </div>
    </div>
  );
}

export default App;
