import { page } from "$app/stores";
import { derived } from "svelte/store";
import EthIcon from "$lib/components/icons/EthIcon.svelte";
import SolIcon from "$lib/components/icons/SolIcon.svelte";
import AtomIcon from "$lib/components/icons/AtomIcon.svelte";
import AdaIcon from "$lib/components/icons/AdaIcon.svelte";
import DotIcon from "$lib/components/icons/DotIcon.svelte";
import XtzIcon from "$lib/components/icons/XtzIcon.svelte";
import NearIcon from "$lib/components/icons/NearIcon.svelte";

export const PROTOCOLS = [
  { name: "Ethereum", token: "eth", icon: EthIcon },
  { name: "Solana", token: "sol", icon: SolIcon },
  { name: "Cosmos", token: "atom", icon: AtomIcon },
  { name: "Cardano", token: "ada", icon: AdaIcon },
  { name: "Polkadot", token: "dot", icon: DotIcon },
  { name: "Tezos", token: "xtz", icon: XtzIcon },
  { name: "Near", token: "near", icon: NearIcon },
] as const;

export type Protocol = (typeof PROTOCOLS)[number];

export type Token = Protocol["token"];

export const protocol = derived(
  page,
  ($page, set) => {
    let protocol = PROTOCOLS.find((p) => p.token === $page.url.searchParams.get("protocol"));
    if (protocol) set(protocol);
  },
  PROTOCOLS[0] as Protocol
);
