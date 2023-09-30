import type { PageServerLoad } from "./$types";
import { parseEthTx } from "$lib/parseEthTx";
import { parseSolTx } from "$lib/parseSolTx";
import { parseAtomTx } from "$lib/parseAtomTx";
import { parseAdaTx } from "$lib/parseAdaTx";
import { parseToken } from "$lib/parseToken";
import { parseDotTx } from "$lib/parseDotTx";
import { parseXtzTx } from "$lib/parseXtzTx";
import { parseNearTx } from "$lib/parseNearTx";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const load = (async ({ url }) => {
  const tx = url.searchParams.get("tx")?.trim();
  const protocol = parseToken(url.searchParams.get("protocol"));

  if (!tx) return;

  try {
    const html = await (() => {
      if (protocol === "eth") return parseEthTx(tx);
      if (protocol === "sol") return parseSolTx(tx);
      if (protocol === "atom") return parseAtomTx(tx);
      if (protocol === "ada") return parseAdaTx(tx);
      if (protocol === "dot") return parseDotTx(tx, false);
      if (protocol === "wnd") return parseDotTx(tx, true);
      if (protocol === "xtz") return parseXtzTx(tx);
      if (protocol === "near") return parseNearTx(tx);
      throw new Error(`Unknown protocol: ${protocol}`);
    })();

    return { html };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}) satisfies PageServerLoad;
