import type { PageServerLoad } from "./$types";
import { parseTransaction } from 'viem';
import { prettyPrintJson } from 'pretty-print-json';

// @ts-ignore
BigInt.prototype.toJSON = function() { return this.toString() }

export const load = (async ({ url }) => {
  const txRaw = url.searchParams.get("txRaw")?.trim();
  if (!txRaw) {
    return { txRaw: "", html: "" };
  }
  try {
    const hex = txRaw.startsWith("0x") ? txRaw : `0x${txRaw}`;
    const tx = parseTransaction(hex as `0x${string}`);
    const html = prettyPrintJson.toHtml(tx, {
      quoteKeys: true,
    })
    return { txRaw, html };
  } catch (err) {
    return { txRaw, html: "", error: err instanceof Error ? err.message : "Unknown error" };
  }
}) satisfies PageServerLoad;
