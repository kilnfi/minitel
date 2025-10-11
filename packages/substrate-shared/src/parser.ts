import type { AnyJson } from '@polkadot/types/types';
import { compactToU8a, u8aConcat } from '@polkadot/util';
import { SubstrateWsClient } from './substrate/substrateWsClient';

const chains = {
  DOT: {
    chainName: 'Polkadot',
    specName: 'polkadot',
    rpcUrl: 'wss://rpc.polkadot.io',
  },
  KSM: {
    chainName: 'Kusama',
    specName: 'kusama',
    rpcUrl: 'wss://kusama-rpc.polkadot.io',
  },
};

export type SupportedSubstrateChains = keyof typeof chains;

const wsClients: {
  [key in SupportedSubstrateChains]?: SubstrateWsClient;
} = {};

export const getWsClient = async (chain: SupportedSubstrateChains) => {
  if (wsClients[chain]?.isConnected) {
    return wsClients[chain];
  }

  const wsClient = new SubstrateWsClient(chains[chain].rpcUrl);
  await wsClient.connect();
  wsClients[chain] = wsClient;
  return wsClient;
};

export const parseSubstrateTx = async (token: SupportedSubstrateChains, txRaw: string): Promise<AnyJson> => {
  const wsClient = await getWsClient(token);

  if (!wsClient || !wsClient.client) {
    throw new Error('Failed to connect to Substrate RPC');
  }

  try {
    // Remove 0x prefix if present
    const cleanedInput = txRaw.trim().startsWith('0x') ? txRaw.trim().substring(2) : txRaw.trim();

    // Check if the input is a JSON payload (SignerPayloadJSON)
    let methodHex = cleanedInput;
    let signerPayloadJson: Record<string, unknown> | null = null;

    try {
      // Try to decode as hex to string to check if it's JSON
      const possibleJson = Buffer.from(cleanedInput, 'hex').toString('utf8');
      if (possibleJson.startsWith('{')) {
        const parsed = JSON.parse(possibleJson);
        if (parsed.method) {
          // This is a SignerPayloadJSON format
          signerPayloadJson = parsed;
          methodHex = parsed.method.startsWith('0x') ? parsed.method.substring(2) : parsed.method;
        }
      }
    } catch {
      // Not JSON, continue with raw hex
    }

    // Convert hex string to Uint8Array
    const txBytes = new Uint8Array(methodHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

    const decodedExtrinsic = wsClient.client.createType('Call', txBytes);
    const prefixed = u8aConcat(compactToU8a(decodedExtrinsic.encodedLength), txBytes);
    const extrinsicPayload = wsClient.client.createType('ExtrinsicPayload', prefixed).toHuman() as Record<
      string,
      unknown
    >;

    // Remove the method field as it will be included in the decoded extrinsic
    delete extrinsicPayload.method;

    // If we have a signer payload JSON, merge it with the decoded data
    const result = {
      ...decodedExtrinsic.toHuman(),
      ...extrinsicPayload,
    };

    if (signerPayloadJson) {
      // Add fields from the signer payload that aren't in the decoded extrinsic
      Object.assign(result, {
        address: signerPayloadJson.address,
        blockHash: signerPayloadJson.blockHash,
        blockNumber: signerPayloadJson.blockNumber,
        era: signerPayloadJson.era,
        genesisHash: signerPayloadJson.genesisHash,
        nonce: signerPayloadJson.nonce,
        specVersion: signerPayloadJson.specVersion,
        tip: signerPayloadJson.tip,
        transactionVersion: signerPayloadJson.transactionVersion,
        version: signerPayloadJson.version,
      });
    }

    return result as AnyJson;
  } catch (error) {
    console.error('Error parsing substrate tx', error);
    throw new Error('Error parsing substrate tx');
  }
};
