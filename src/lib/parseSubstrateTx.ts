import { SubstrateWsClient } from "./substrate/substrateWsClient";
import type { AnyJson } from "@polkadot/types/types";

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
    const decoded = wsClient.registry.createType("ExtrinsicPayload", txRaw) as any;
    const call = wsClient.registry.createType("Call", decoded.method.toHex()).toHuman();
    const payloadHumand = decoded.toHuman();
    delete payloadHumand.method;
    return {
      ...call,
      ...payloadHumand,
    };
  } catch (error) {
    console.error("Error parsing substrate tx", error);
    throw new Error("Error parsing substrate tx");
  }
};
