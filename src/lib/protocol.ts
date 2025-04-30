import { page } from "$app/stores";
import { derived } from "svelte/store";
import EthIcon from "$lib/components/icons/EthIcon.svelte";
import SolIcon from "$lib/components/icons/SolIcon.svelte";
import AtomIcon from "$lib/components/icons/AtomIcon.svelte";
import AdaIcon from "$lib/components/icons/AdaIcon.svelte";
import DotIcon from "$lib/components/icons/DotIcon.svelte";
import XtzIcon from "$lib/components/icons/XtzIcon.svelte";
import NearIcon from "$lib/components/icons/NearIcon.svelte";
import KsmIcon from "./components/icons/KsmIcon.svelte";
import SuiIcon from "$lib/components/icons/SuiIcon.svelte";
import TonIcon from "$lib/components/icons/TonIcon.svelte";
import TrxIcon from "./components/icons/TrxIcon.svelte";

export const PROTOCOLS = [
  { name: "Ethereum", token: "eth", icon: EthIcon },
  { name: "Solana", token: "sol", icon: SolIcon },
  { name: "Cosmos", token: "cosmos", icon: AtomIcon },
  { name: "Cardano", token: "ada", icon: AdaIcon },
  { name: "Polkadot", token: "dot", icon: DotIcon },
  { name: "Kusama", token: "ksm", icon: KsmIcon },
  { name: "Tezos", token: "xtz", icon: XtzIcon },
  { name: "Near", token: "near", icon: NearIcon },
  { name: "Sui", token: "sui", icon: SuiIcon },
  { name: "Ton", token: "ton", icon: TonIcon },
  { name: "Trx", token: "trx", icon: TrxIcon },
] as const;

export type Protocol = (typeof PROTOCOLS)[number];

export type Token = Protocol["token"];

export const protocol = derived(
  page,
  ($page, set) => {
    let protocol = PROTOCOLS.find((p) => {
      //todo: remove when dashboard only use ?protocol=cosmos
      if ($page.url.searchParams.get("protocol") === "atom") return p.token === "cosmos";
      return p.token === $page.url.searchParams.get("protocol");
    });
    if (protocol) set(protocol);
  },
  PROTOCOLS[0] as Protocol
);
