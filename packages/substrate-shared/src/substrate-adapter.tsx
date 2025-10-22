import type { AnyJson } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import type { Protocol, ProtocolAdapter } from '@protocols/shared';
import { getWsClient, parseSubstrateTx, type SupportedSubstrateChains } from './parser';

const computeSubstrateHash = async (token: SupportedSubstrateChains, rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();
    const cleanedInput = input.startsWith('0x') ? input.substring(2) : input;

    // Decode hex to get the SignerPayloadJSON
    const bytes = new Uint8Array(cleanedInput.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const jsonString = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(jsonString);

    // Get the WebSocket client to access the Polkadot API registry
    const wsClient = await getWsClient(token);
    if (!wsClient || !wsClient.client) {
      throw new Error('Failed to connect to Substrate RPC');
    }

    const { registry } = wsClient.client;

    // Encode SignerPayload fields in order (matches API's signer_payload.toRaw().data)
    // Format v5: method + era + nonce + tip + assetId + [metadataHash (KSM only)] + specVersion + transactionVersion + genesisHash + blockHash + mode
    const encodedFields = [
      registry.createType('Call', payload.method).toU8a(),
      registry.createType('ExtrinsicEra', payload.era).toU8a(),
      registry.createType('Compact<Index>', payload.nonce).toU8a(),
      registry.createType('Compact<u128>', payload.tip).toU8a(),
      payload.assetId ? registry.createType('Option<u32>', payload.assetId).toU8a() : new Uint8Array([0x00]),
      ...(token === 'KSM' ? [payload.metadataHash ? registry.createType('Option<Hash>', payload.metadataHash).toU8a() : new Uint8Array([0x00])] : []),
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
  }
};

export const createSubstrateAdapter = ({
  name,
  displayName,
  protocol,
  token,
}: {
  name: string;
  displayName: string;
  protocol: Protocol;
  token: SupportedSubstrateChains;
}): ProtocolAdapter<AnyJson> => {
  return {
    protocol,
    name,
    displayName,
    placeholder: 'Paste your transaction as hex',
    parseTransaction: async (rawTx) => parseSubstrateTx(token, rawTx),
    computeHash: async (rawTx) => computeSubstrateHash(token, rawTx),
  };
};
