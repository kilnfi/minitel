import {
  AdaIcon,
  CosmosIcon,
  CronosIcon,
  DydxIcon,
  EthereumIcon,
  FetchIcon,
  InjectiveIcon,
  KavaIcon,
  NearIcon,
  OmIcon,
  OsmosisIcon,
  SeiIcon,
  SolanaIcon,
  SuiIcon,
  TiaIcon,
  TonIcon,
  XtzIcon,
  ZetaIcon,
} from '@protocols/ui';

type CosmosToken = 'ATOM' | 'TIA' | 'ZETA' | 'OSMO' | 'DYDX' | 'FET' | 'INJ' | 'KAVA' | 'OM' | 'CRO' | 'SEI';

export type Token = CosmosToken | 'ETH' | 'NEAR' | 'SOL' | 'ADA' | 'SUI' | 'XTZ' | 'TON';

export type Protocol = {
  token: Token;
  name: string;
  icon?: React.ReactNode;
  url: string;
  localUrl: string;
};

export const protocols: Protocol[] = [
  {
    token: 'ETH',
    name: 'Ethereum',
    icon: <EthereumIcon className="size-5" />,
    url: 'https://eth.minitel.app',
    localUrl: 'http://localhost:3000',
  },
  {
    token: 'SOL',
    name: 'Solana',
    icon: <SolanaIcon className="size-5" />,
    url: 'https://sol.minitel.app',
    localUrl: 'http://localhost:3001',
  },
  {
    token: 'ATOM',
    name: 'Cosmos',
    icon: <CosmosIcon className="size-5" />,
    url: 'https://atom.minitel.app',
    localUrl: 'http://localhost:3002',
  },
  {
    token: 'NEAR',
    name: 'Near',
    icon: <NearIcon className="size-5" />,
    url: 'https://near.minitel.app',
    localUrl: 'http://localhost:3003',
  },
  {
    token: 'CRO',
    name: 'Cronos',
    icon: <CronosIcon className="size-5" />,
    url: 'https://cro.minitel.app',
    localUrl: 'http://localhost:3004',
  },
  {
    token: 'SEI',
    name: 'Sei',
    icon: <SeiIcon className="size-5" />,
    url: 'https://sei.minitel.app',
    localUrl: 'http://localhost:3005',
  },
  {
    token: 'ZETA',
    name: 'Zeta',
    icon: <ZetaIcon className="size-5" />,
    url: 'https://zeta.minitel.app',
    localUrl: 'http://localhost:3006',
  },
  {
    token: 'DYDX',
    name: 'Dydx',
    icon: <DydxIcon className="size-5" />,
    url: 'https://dydx.minitel.app',
    localUrl: 'http://localhost:3007',
  },
  {
    token: 'FET',
    name: 'Fetch',
    icon: <FetchIcon className="size-5" />,
    url: 'https://fetch.minitel.app',
    localUrl: 'http://localhost:3008',
  },
  {
    token: 'INJ',
    name: 'Injective',
    icon: <InjectiveIcon className="size-5" />,
    url: 'https://inj.minitel.app',
    localUrl: 'http://localhost:3009',
  },
  {
    token: 'KAVA',
    name: 'Kava',
    icon: <KavaIcon className="size-5" />,
    url: 'https://kava.minitel.app',
    localUrl: 'http://localhost:3010',
  },
  {
    token: 'OM',
    name: 'Mantra',
    icon: <OmIcon className="size-5" />,
    url: 'https://om.minitel.app',
    localUrl: 'http://localhost:3011',
  },
  {
    token: 'TIA',
    name: 'Tia',
    icon: <TiaIcon className="size-5" />,
    url: 'https://tia.minitel.app',
    localUrl: 'http://localhost:3012',
  },
  {
    token: 'OSMO',
    name: 'Osmosis',
    icon: <OsmosisIcon className="size-5" />,
    url: 'https://osmo.minitel.app',
    localUrl: 'http://localhost:3013',
  },
  {
    token: 'ADA',
    name: 'Ada',
    icon: <AdaIcon className="size-5" />,
    url: 'https://ada.minitel.app',
    localUrl: 'http://localhost:3014',
  },
  {
    token: 'SUI',
    name: 'Sui',
    icon: <SuiIcon className="size-5" />,
    url: 'https://sui.minitel.app',
    localUrl: 'http://localhost:3015',
  },
  {
    token: 'XTZ',
    name: 'Xtz',
    icon: <XtzIcon className="size-5" />,
    url: 'https://xtz.minitel.app',
    localUrl: 'http://localhost:3016',
  },
  {
    token: 'TON',
    name: 'Ton',
    icon: <TonIcon className="size-5" />,
    url: 'https://ton.minitel.app',
    localUrl: 'http://localhost:3017',
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
