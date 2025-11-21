export type SupportedProtocol =
  | 'ethereum'
  | 'solana'
  | 'near'
  | 'ada'
  | 'sui'
  | 'ton'
  | 'trx'
  | 'xtz'
  | 'atom'
  | 'dydx'
  | 'injective'
  | 'kava'
  | 'mantra'
  | 'osmosis'
  | 'sei'
  | 'tia'
  | 'zeta'
  | 'cronos'
  | 'fetch'
  | 'dot'
  | 'ksm';

export type DecodeRequest = {
  protocol: SupportedProtocol;
  rawTx: string;
};

export type DecodeResponse = {
  protocol: string;
  decodedTransaction: unknown;
  hash: string;
  warnings?: Array<{ message: string }>;
};

export type ErrorResponse = {
  error: string;
  message: string;
  protocol?: string;
};

export type HealthResponse = {
  status: 'ok';
  protocols: SupportedProtocol[];
  version: string;
};

export type ApiProtocolAdapter<T = unknown> = {
  protocol: string;
  name: string;
  displayName: string;
  parseTransaction: (rawTx: string) => Promise<T>;
  computeHash: (rawTx: string) => string | Promise<string>;
  generateWarnings?: (data: T) => Array<{ message: string }>;
};
