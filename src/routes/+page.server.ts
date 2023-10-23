import type { PageServerLoad } from "./$types";
import { createHash } from "node:crypto";
import { parseEthTx } from "$lib/parseEthTx";
import { parseSolTx } from "$lib/parseSolTx";
import { parseAtomTx } from "$lib/parseAtomTx";
import { parseAdaTx } from "$lib/parseAdaTx";
import { parseToken } from "$lib/parseToken";
import { parseDotTx } from "$lib/parseDotTx";
import { parseXtzTx } from "$lib/parseXtzTx";
import { parseNearTx } from "$lib/parseNearTx";
import { Buffer } from "buffer";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const load = (async ({ url }) => {
  const action = url.searchParams.get("action");
  const tx = url.searchParams.get("tx")?.trim();
  const protocol = parseToken(url.searchParams.get("protocol"));

  if (!tx) return;

  try {
    if (action === "hash") {
      const txU = Uint8Array.from(Buffer.from(tx, "hex"));
      const hash = createHash("sha256").update(txU).digest("hex");
      return { html: `<span class="text-white">${hash}</span>` };
    }
    const html = await (() => {
      if (protocol === "eth") return parseEthTx(tx);
      if (protocol === "sol") return parseSolTx(tx);
      if (protocol === "atom") return parseAtomTx(tx);
      if (protocol === "ada") return parseAdaTx(tx);
      if (protocol === "dot") return parseDotTx(tx);
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
