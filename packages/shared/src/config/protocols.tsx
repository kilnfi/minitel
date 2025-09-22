import { EthereumIcon, type Protocol, SolanaIcon } from '@protocols/ui';

export const protocols: Protocol[] = [
  {
    name: 'Ethereum',
    icon: <EthereumIcon className="size-5" />,
    url: 'https://eth.minitel.app',
    localUrl: 'http://localhost:3000',
  },
  {
    name: 'Solana',
    icon: <SolanaIcon className="size-5" />,
    url: 'https://sol.minitel.app',
    localUrl: 'http://localhost:3001',
  },
];

export const getCurrentProtocol = () => {
  const currentOrigin = window.location.origin;
  const currentProtocol = protocols.find(
    (protocol) => protocol.url === currentOrigin || protocol.localUrl === currentOrigin,
  );
  if (!currentProtocol) {
    throw new Error('Current protocol is not defined');
  }
  return currentProtocol;
};
