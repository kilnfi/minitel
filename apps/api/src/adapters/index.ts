import type { ApiProtocolAdapter, SupportedProtocol } from '@/types/api';
import { hashEthTx, parseEthTx } from '@/parsers/ethereum';
import { parseSolTx } from '@/parsers/solana';
import { parseNearTx } from '@/parsers/near';
import { parseAdaTx } from '@/parsers/ada';
import { parseSuiTx } from '@/parsers/sui';
import { parseTonTx } from '@/parsers/ton';
import { parseTrxTx } from '@/parsers/trx';
import { parseXtzTx } from '@/parsers/xtz';
import { parseCosmosTx } from '@/parsers/cosmos';
import { parseSubstrateTx, computeSubstrateHash, type SupportedSubstrateChains } from '@/parsers/substrate';
import { formatEther } from 'viem';

// Ethereum adapter
const ethereumAdapter: ApiProtocolAdapter = {
  protocol: 'ethereum',
  name: 'ethereum',
  displayName: 'Ethereum',
  parseTransaction: parseEthTx,
  computeHash: hashEthTx,
  generateWarnings: (data: any) => {
    const valueWei = data.value ?? 0n;
    const ethAmount = formatEther(valueWei);
    const isHighValue = Number(ethAmount) > 1;
    const warnings = [];
    if (isHighValue) {
      warnings.push({ message: `High value transaction: ${ethAmount} ETH` });
    }
    return warnings;
  },
};

// Solana adapter
const solanaAdapter: ApiProtocolAdapter = {
  protocol: 'solana',
  name: 'solana',
  displayName: 'Solana',
  parseTransaction: parseSolTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// NEAR adapter
const nearAdapter: ApiProtocolAdapter = {
  protocol: 'near',
  name: 'near',
  displayName: 'NEAR',
  parseTransaction: parseNearTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// Cardano adapter
const adaAdapter: ApiProtocolAdapter = {
  protocol: 'ada',
  name: 'ada',
  displayName: 'Cardano',
  parseTransaction: parseAdaTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// Sui adapter
const suiAdapter: ApiProtocolAdapter = {
  protocol: 'sui',
  name: 'sui',
  displayName: 'Sui',
  parseTransaction: parseSuiTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// TON adapter
const tonAdapter: ApiProtocolAdapter = {
  protocol: 'ton',
  name: 'ton',
  displayName: 'TON',
  parseTransaction: parseTonTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'base64');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// Tron adapter
const trxAdapter: ApiProtocolAdapter = {
  protocol: 'trx',
  name: 'trx',
  displayName: 'Tron',
  parseTransaction: parseTrxTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// Tezos adapter
const xtzAdapter: ApiProtocolAdapter = {
  protocol: 'xtz',
  name: 'xtz',
  displayName: 'Tezos',
  parseTransaction: parseXtzTx,
  computeHash: async (rawTx) => {
    const buffer = Buffer.from(rawTx, 'hex');
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// Cosmos chain adapters (all use same parser)
const createCosmosAdapter = (protocol: SupportedProtocol, displayName: string): ApiProtocolAdapter => ({
  protocol,
  name: protocol,
  displayName,
  parseTransaction: parseCosmosTx,
  computeHash: async (rawTx) => {
    const input = rawTx.trim();
    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
});

// Substrate chain adapters
const createSubstrateAdapter = (
  protocol: 'dot' | 'ksm',
  chain: SupportedSubstrateChains,
  displayName: string,
): ApiProtocolAdapter => ({
  protocol,
  name: protocol,
  displayName,
  parseTransaction: async (rawTx) => parseSubstrateTx(chain, rawTx),
  computeHash: async (rawTx) => computeSubstrateHash(chain, rawTx),
});

// Protocol adapter registry
export const protocolAdapters: Record<SupportedProtocol, ApiProtocolAdapter> = {
  ethereum: ethereumAdapter,
  solana: solanaAdapter,
  near: nearAdapter,
  ada: adaAdapter,
  sui: suiAdapter,
  ton: tonAdapter,
  trx: trxAdapter,
  xtz: xtzAdapter,
  atom: createCosmosAdapter('atom', 'Cosmos'),
  dydx: createCosmosAdapter('dydx', 'dYdX'),
  injective: createCosmosAdapter('injective', 'Injective'),
  kava: createCosmosAdapter('kava', 'Kava'),
  mantra: createCosmosAdapter('mantra', 'Mantra'),
  osmosis: createCosmosAdapter('osmosis', 'Osmosis'),
  sei: createCosmosAdapter('sei', 'Sei'),
  tia: createCosmosAdapter('tia', 'Celestia'),
  zeta: createCosmosAdapter('zeta', 'ZetaChain'),
  cronos: createCosmosAdapter('cronos', 'Cronos'),
  fetch: createCosmosAdapter('fetch', 'Fetch.ai'),
  dot: createSubstrateAdapter('dot', 'DOT', 'Polkadot'),
  ksm: createSubstrateAdapter('ksm', 'KSM', 'Kusama'),
};

export const getAdapter = (protocol: SupportedProtocol): ApiProtocolAdapter => {
  const adapter = protocolAdapters[protocol];
  if (!adapter) {
    throw new Error(`Unsupported protocol: ${protocol}`);
  }
  return adapter;
};

export const getSupportedProtocols = (): SupportedProtocol[] => {
  return Object.keys(protocolAdapters) as SupportedProtocol[];
};
