import { parseAdaTx } from "$lib/parseAdaTx";
import { parseCosmosTx } from "$lib/parseCosmosTx";
import { parseDotTx } from "$lib/parseDotTx";
import { parseEthTx } from "$lib/parseEthTx";
import { parseNearTx } from "$lib/parseNearTx";
import { parseSolTx } from "$lib/parseSolTx";
import { parseToken } from "$lib/parseToken";
import { parseXtzTx } from "$lib/parseXtzTx";
import { Buffer } from "buffer";
import { createHash } from "node:crypto";
import type { PageServerLoad } from "./$types";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const load = (async ({ url }) => {
  const action = url.searchParams.get("action");
  const tx = url.searchParams.get("tx")?.trim();
  let protocol = parseToken(url.searchParams.get("protocol"));

  // todo remove when dashboard only use ?protocol=cosmos
  if (url.searchParams.get("protocol") === "atom") protocol = "cosmos";

  if (!tx) return;

  try {
    if (action === "hash") {
      const txU = Uint8Array.from(Buffer.from(tx, "hex"));
      const txHash = createHash("sha256").update(txU).digest("hex");
      return { txHash };
    }
    const decodedTx = await (() => {
      if (protocol === "eth") return parseEthTx(tx);
      if (protocol === "sol") return parseSolTx(tx);
      if (protocol === "cosmos") return parseCosmosTx(tx);
      if (protocol === "ada") return parseAdaTx(tx);
      if (protocol === "dot") return parseDotTx(tx);
      if (protocol === "xtz") return parseXtzTx(tx);
      if (protocol === "near") return parseNearTx(tx);
      throw new Error(`Unknown protocol: ${protocol}`);
    })();

    return { decodedTx };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}) satisfies PageServerLoad;
