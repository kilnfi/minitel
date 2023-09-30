import { prettyPrintJson } from "pretty-print-json";
import { decode, getRegistry, type OptionsWithMeta } from "@substrate/txwrapper-polkadot";

type RegistryInfo = {
  chainName: string;
  specName:
    | "kusama"
    | "polkadot"
    | "westend"
    | "statemint"
    | "statemine"
    | "westmint"
    | "asset-hub-kusama"
    | "asset-hub-polkadot"
    | "asset-hub-westend";
  rpcUrl: string;
};
const REGISTRIES: { [key: string]: RegistryInfo } = {
  testnet: {
    chainName: "Westend",
    specName: "westend",
    rpcUrl: "https://westend-rpc.polkadot.io",
  },
  mainnet: {
    chainName: "Polkadot",
    specName: "polkadot",
    rpcUrl: "https://rpc.polkadot.io",
  },
};

export const parseDotTx = async (txRaw: string, testnet = false): Promise<string> => {
  const options = await getOptionsWithMeta(testnet);
  const tx = decode(txRaw, options);
  return prettyPrintJson.toHtml(tx, { quoteKeys: true });
};

const getOptionsWithMeta = async (
  testnet: boolean
): Promise<any | (OptionsWithMeta & { specVersion: any; transactionVersion: any })> => {
  const metadataRpc = await rpcToNode("state_getMetadata", [], testnet);
  const runtimeVersion = await rpcToNode("state_getRuntimeVersion", [], testnet);

  const registry = getRegistry({
    ...REGISTRIES[testnet ? "testnet" : "mainnet"],
    metadataRpc: metadataRpc.result,
    specVersion: runtimeVersion.result.specVersion,
  });
  return {
    registry,
    metadataRpc: metadataRpc.result,
    specVersion: runtimeVersion.result.specVersion,
    transactionVersion: runtimeVersion.result.transactionVersion,
  };
};

const rpcToNode = async (method: string, params: any[] = [], testnet = false): Promise<any> => {
  try {
    const res = await fetch(
      REGISTRIES[testnet ? "testnet" : "mainnet"].rpcUrl + "?method=" + method,
      {
        method: "POST",
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method,
          params,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  } catch (err: any) {
    throw new Error(`Error calling ${method}: ${err.message}`);
  }
};
