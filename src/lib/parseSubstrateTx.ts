import { ApiPromise, HttpProvider } from "@polkadot/api";
import {
  decode,
  getRegistry,
  type OptionsWithMeta,
  type TypeRegistry,
} from "@substrate/txwrapper-polkadot";

const chains = {
  DOT: {
    chainName: "Polkadot",
    specName: "polkadot",
    rpcUrl: "https://rpc.polkadot.io",
  },
  KSM: {
    chainName: "Kusama",
    specName: "kusama",
    rpcUrl: "https://kusama-rpc.polkadot.io",
  },
} as const;
export type SupportedSubstrateChains = keyof typeof chains;
type ChainOptions =
  | OptionsWithMeta
  | { metadataRpc: `0x${string}`; registry: TypeRegistry; specVersion: number };
const cachedChainOptions: Map<SupportedSubstrateChains, ChainOptions> = new Map();

const chainOptions = async (chain: SupportedSubstrateChains) => {
  if (cachedChainOptions.has(chain)) {
    return cachedChainOptions.get(chain)!;
  }
  const client = await ApiPromise.create({ provider: new HttpProvider(chains[chain].rpcUrl) });
  const metadataRpc = (await client.rpc.state.getMetadata()).toHex();

  const runtimeVersion = await client.rpc.state.getRuntimeVersion();
  const specVersion = runtimeVersion.specVersion.toNumber();

  const registry = getRegistry({
    ...chains[chain],
    metadataRpc,
    specVersion,
  });
  const options = { metadataRpc, registry, specVersion };
  cachedChainOptions.set(chain, options);
  return options;
};

export const parseSubstrateTx = async (
  token: SupportedSubstrateChains,
  txRaw: string
): Promise<object> => {
  const payload = decode(
    JSON.parse(Buffer.from(txRaw, "hex").toString()),
    await chainOptions(token)
  );
  payload.metadataRpc = "0x"; // remove heavy and unnecessary metadata
  return payload;
};
