import type { AnyJson } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { compactToU8a, u8aConcat } from '@polkadot/util';

const chains = {
  DOT: {
    chainName: 'Polkadot',
    specName: 'polkadot',
    rpcUrl: 'wss://statemint.api.onfinality.io/public-ws',
  },
  KSM: {
    chainName: 'Kusama',
    specName: 'kusama',
    rpcUrl: 'wss://assethub-kusama.api.onfinality.io/public-ws',
  },
};

export type SupportedSubstrateChains = keyof typeof chains;

// Connection per request pattern (no connection pooling)
const createWsClient = async (chain: SupportedSubstrateChains) => {
  const wsProvider = new WsProvider(chains[chain].rpcUrl);
  const client = await ApiPromise.create({ provider: wsProvider });
  return { client, wsProvider };
};

export const parseSubstrateTx = async (token: SupportedSubstrateChains, txRaw: string): Promise<AnyJson> => {
  let client: ApiPromise | null = null;
  let wsProvider: WsProvider | null = null;

  try {
    // Create connection for this request
    const connection = await createWsClient(token);
    client = connection.client;
    wsProvider = connection.wsProvider;

    // Remove 0x prefix if present
    const cleanedInput = txRaw.trim().startsWith('0x') ? txRaw.trim().substring(2) : txRaw.trim();

    // Check if the input is a JSON payload (SignerPayloadJSON)
    let methodHex = cleanedInput;
    let signerPayloadJson: Record<string, unknown> | null = null;

    try {
      // Try to decode as hex to string to check if it's JSON
      const bytes = new Uint8Array(cleanedInput.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
      const possibleJson = new TextDecoder('utf-8').decode(bytes);
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

    const decodedExtrinsic = client.createType('Call', txBytes);
    const prefixed = u8aConcat(compactToU8a(decodedExtrinsic.encodedLength), txBytes);
    const extrinsicPayload = client.createType('ExtrinsicPayload', prefixed).toHuman() as Record<string, unknown>;

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
  } finally {
    // IMPORTANT: Disconnect after each request
    if (client) {
      await client.disconnect();
    }
  }
};

// Hash computation for Substrate
export const computeSubstrateHash = async (token: SupportedSubstrateChains, rawTx: string): Promise<string> => {
  let client: ApiPromise | null = null;
  let wsProvider: WsProvider | null = null;

  try {
    const input = rawTx.trim();
    const cleanedInput = input.startsWith('0x') ? input.substring(2) : input;

    // Decode hex to get the SignerPayloadJSON
    const bytes = new Uint8Array(cleanedInput.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const jsonString = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(jsonString);

    // Get the WebSocket client to access the Polkadot API registry
    const connection = await createWsClient(token);
    client = connection.client;
    wsProvider = connection.wsProvider;

    const { registry } = client;

    // Encode SignerPayload fields in order (matches API's signer_payload.toRaw().data)
    const encodedFields = [
      registry.createType('Call', payload.method).toU8a(),
      registry.createType('ExtrinsicEra', payload.era).toU8a(),
      registry.createType('Compact<Index>', payload.nonce).toU8a(),
      registry.createType('Compact<u128>', payload.tip).toU8a(),
      payload.assetId ? registry.createType('Option<u32>', payload.assetId).toU8a() : new Uint8Array([0x00]),
      payload.metadataHash ? registry.createType('Option<Hash>', payload.metadataHash).toU8a() : new Uint8Array([0x00]),
      registry.createType('u32', payload.specVersion).toU8a(),
      registry.createType('u32', payload.transactionVersion).toU8a(),
      registry.createType('Hash', payload.genesisHash).toU8a(),
      registry.createType('Hash', payload.blockHash).toU8a(),
      payload.mode !== undefined ? registry.createType('u8', payload.mode).toU8a() : new Uint8Array([0x00]),
    ];

    const signingPayload = new Uint8Array(encodedFields.reduce((acc, field) => acc + field.length, 0));
    let offset = 0;
    for (const field of encodedFields) {
      signingPayload.set(field, offset);
      offset += field.length;
    }

    return u8aToHex(signingPayload).substring(2);
  } catch (error) {
    console.error('Failed to compute Substrate hash:', error);
    throw new Error('Failed to compute Substrate hash');
  } finally {
    // IMPORTANT: Disconnect after each request
    if (client) {
      await client.disconnect();
    }
  }
};
