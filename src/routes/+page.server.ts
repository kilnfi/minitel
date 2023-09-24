import type { PageServerLoad } from "./$types";
import { parseEthTx } from "$lib/parseEthTx";
import { parseSolTx } from "$lib/parseSolTx";

// @ts-ignore
BigInt.prototype.toJSON = function() { return this.toString() }


export const load = (async ({ url }) => {
  const txRaw = url.searchParams.get("txRaw")?.trim();
  const protocol = url.searchParams.get("protocol");
  if (!txRaw || !protocol) {
    return { txRaw: "", html: "", protocol: "" };
  }

  try {
    let html = "";
    switch (protocol) {
      case 'ETH':
        html = await parseEthTx(txRaw);
        break;
      case 'SOL':
        html = await parseSolTx(txRaw);
        break;
      default:
        return {
          txRaw,
          protocol,
          html,
          error: "Unknown protocol"
        };
    }
    return {
      txRaw,
      protocol,
      html,
      error: ""
    };
  } catch (err) {
    console.log(err);
    return {
      txRaw,
      protocol,
      html: "",
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}) satisfies PageServerLoad;
