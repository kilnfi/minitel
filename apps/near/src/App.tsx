import { getCurrentProtocol, protocols } from '@protocols/shared';
import { Background, cn, Header, type Protocol, ProtocolTransactionDecoder } from '@protocols/ui';
import { nearAdapter } from '@/near-adapter';

const currentProtocol = getCurrentProtocol();

function App() {
  const onChangeProtocol = (protocol: Protocol) => {
    const protocolUrl = import.meta.env.DEV ? protocol.localUrl : protocol.url;
    window.open(protocolUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="flex">
        <div className={cn('relative w-full transition-all duration-300 ease-in-out')}>
          <Background />
          <Header protocols={protocols} currentProtocol={currentProtocol} onChangeProtocol={onChangeProtocol} />
          <ProtocolTransactionDecoder adapter={nearAdapter} />
        </div>
      </div>
    </div>
  );
}

export default App;
