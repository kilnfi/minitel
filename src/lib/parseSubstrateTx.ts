import { SubstrateWsClient } from "./substrate/substrateWsClient";
import type { AnyJson, SignerPayloadJSON } from "@polkadot/types/types";
import { compactToU8a, u8aConcat } from "@polkadot/util";

const chains = {
  DOT: {
    chainName: "Polkadot",
    specName: "polkadot",
    rpcUrl: "wss://rpc.polkadot.io",
  },
  KSM: {
    chainName: "Kusama",
    specName: "kusama",
    rpcUrl: "wss://kusama-rpc.polkadot.io",
  },
};

export type SupportedSubstrateChains = keyof typeof chains;

let wsClients: {
  [key in SupportedSubstrateChains]?: SubstrateWsClient;
} = {};

const getWsClient = async (chain: SupportedSubstrateChains) => {
  if (wsClients[chain] && wsClients[chain].isConnected) {
    return wsClients[chain];
  }

  const wsClient = new SubstrateWsClient(chains[chain].rpcUrl);
  await wsClient.connect();
  wsClients[chain] = wsClient;
  return wsClient;
};

export const parseSubstrateTx = async (
  token: SupportedSubstrateChains,
  txRaw: string
): Promise<AnyJson> => {
  const wsClient = await getWsClient(token);
  try {
    const decodedExtrinsic = wsClient.client.createType('Call', txRaw);
    const prefixed = u8aConcat(compactToU8a(decodedExtrinsic.encodedLength), txRaw);
    const extrinsic_payload = wsClient.client.createType('ExtrinsicPayload', prefixed).toHuman() as any;
    delete extrinsic_payload.method;
    return {
      ...decodedExtrinsic.toHuman(),
      ...extrinsic_payload,
    };
  } catch (error) {
    console.error("Error parsing substrate tx", error);
    throw new Error("Error parsing substrate tx");
  }
};
