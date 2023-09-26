import { page } from "$app/stores";
import { derived } from "svelte/store";

export const PROTOCOLS = [
  { name: "Ethereum", token: "eth" },
  { name: "Solana", token: "sol" },
  { name: "Cosmos", token: "atom" },
  { name: "Cardano", token: "ada" },
] as const;

export type Protocol = (typeof PROTOCOLS)[number];

export type TokenNames = Protocol["name"];

export type Token = Protocol["token"];

export const protocol = derived(
  page,
  ($page, set) => {
    let protocol = PROTOCOLS.find((p) => $page.url.pathname.startsWith(`/${p.token}`));
    if (protocol) set(protocol);
  },
  PROTOCOLS[0] as Protocol
);
