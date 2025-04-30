import { parseAdaTx } from "$lib/parseAdaTx";
import { parseCosmosTx } from "$lib/parseCosmosTx";
import { hashEthTx, parseEthTx } from "$lib/parseEthTx";
import { parseNearTx } from "$lib/parseNearTx";
import { parseSolTx } from "$lib/parseSolTx";
import { parseSubstrateTx, type SupportedSubstrateChains } from "$lib/parseSubstrateTx";
import { parseToken } from "$lib/parseToken";
import { parseXtzTx } from "$lib/parseXtzTx";
import { parseTonTx } from "$lib/parseTonTx";
import { parseTrxTx } from "$lib/parseTrxTx";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import type { PageServerLoad } from "./$types";
import { FixedTransaction } from "@emurgo/cardano-serialization-lib-nodejs";
import { parseSuiTx } from "$lib/parseSuiTx";

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
      if (protocol === "ada") {
        const fixedTx = FixedTransaction.from_hex(tx);
        const txHash = Buffer.from(fixedTx.transaction_hash().to_bytes()).toString("hex");
        return { txHash };
      }
      if (protocol === "eth") return { txHash: hashEthTx(tx) };

      const txU = Uint8Array.from(Buffer.from(tx, "hex"));
      const txHash = createHash("sha256").update(txU).digest("hex");
      return { txHash };
    }

    const decodedTx = await (() => {
      if (protocol === "eth") return parseEthTx(tx);
      if (protocol === "sol") return parseSolTx(tx);
      if (protocol === "cosmos") return parseCosmosTx(tx);
      if (protocol === "ada") return parseAdaTx(tx);
      if (protocol === "sui") return parseSuiTx(tx);
      if (protocol === "dot" || protocol === "ksm")
        return parseSubstrateTx(protocol.toUpperCase() as SupportedSubstrateChains, tx);
      if (protocol === "xtz") return parseXtzTx(tx);
      if (protocol === "near") return parseNearTx(tx);
      if (protocol === "ton") return parseTonTx(tx);
      if (protocol === "trx") return parseTrxTx(tx);
      throw new Error(`Unknown protocol: ${protocol}`);
    })();
    return { decodedTx: JSON.parse(JSON.stringify(decodedTx)) };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}) satisfies PageServerLoad;
