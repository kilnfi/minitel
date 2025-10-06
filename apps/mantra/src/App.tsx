import { createCosmosAdapter } from '@protocols/cosmos-shared';
import { getCurrentProtocol, OM, PROTOCOLS, type Protocol } from '@protocols/shared';
import { Background, cn, Header, ProtocolTransactionDecoder } from '@protocols/ui';

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
          <Header protocols={PROTOCOLS} currentProtocol={currentProtocol} onChangeProtocol={onChangeProtocol} />
          <ProtocolTransactionDecoder
            adapter={createCosmosAdapter({ protocol: OM, name: 'mantra', displayName: 'Mantra' })}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
