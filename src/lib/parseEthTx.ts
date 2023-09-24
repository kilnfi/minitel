import { decodeFunctionData, parseTransaction, type TransactionSerializableLegacy } from "viem";
import { ETHERSCAN_API_KEY } from "$env/static/private";
import { prettyPrintJson } from "pretty-print-json";

type AugmentedTransaction = TransactionSerializableLegacy & {
  functionName?: string;
  args?: any[];
}

export const parseEthTx = async (txRaw: string): Promise<string> => {
  const hex = txRaw.startsWith("0x") ? txRaw : `0x${txRaw}`;
  const tx: AugmentedTransaction = parseTransaction(hex as `0x${string}`);

  // try to get ABI and function name and args from etherscan
  if (tx.data) {
    const response = await fetch(`https://${tx.chainId === 5 ? 'api-goerli' : 'api'}.etherscan.io/api?module=contract&action=getabi&address=${tx.to}&apikey=${ETHERSCAN_API_KEY}`).then(res => res.json());
    if (response.status === '1') {
      try {
        const abi = JSON.parse(response.result);
        const { functionName, args } = decodeFunctionData({
          abi,
          data: tx.data,
        })
        tx.functionName = functionName;
        tx.args = args;
      } catch (err) {
        console.error(err);
      }
    }
  }

  return prettyPrintJson.toHtml(tx, {
    quoteKeys: true,
  })
}