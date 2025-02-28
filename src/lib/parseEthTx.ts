import { ETHERSCAN_API_KEY } from "$env/static/private";
import { decodeFunctionData, keccak256, parseTransaction, serializeTransaction, type TransactionSerializableLegacy } from "viem";
import { formatAbiItem } from "viem/utils";

type AugmentedTransaction = TransactionSerializableLegacy & {
  inputData?: {
    functionName: string;
    functionSignature: string;
    args: any[];
  };
};

export const hashEthTx = (txRaw: string): string => {
  const hex = txRaw.startsWith("0x") ? txRaw : `0x${txRaw}`;
  return keccak256(serializeTransaction( parseTransaction(hex as `0x${string}`)));
}

export const parseEthTx = async (txRaw: string): Promise<object> => {
  const hex = txRaw.startsWith("0x") ? txRaw : `0x${txRaw}`;
  const tx: AugmentedTransaction = parseTransaction(hex as `0x${string}`);

  // try to get ABI and function name and args from etherscan
  if (tx.data && tx.to && tx.chainId) {
    const url = new URL("https://api.etherscan.io/api");
    url.searchParams.append("chainid", tx.chainId.toString());
    url.searchParams.append("module", "contract");
    url.searchParams.append("action", "getabi");
    url.searchParams.append("address", tx.to);
    url.searchParams.append("apikey", ETHERSCAN_API_KEY);

    const res = await (await fetch(url)).json();
    console.log(res);
    if (res.status === "1") {
      try {
        const abi = JSON.parse(res.result);
        const { functionName, args } = decodeFunctionData({ abi, data: tx.data });

        tx.inputData = {
          functionName: functionName,
          functionSignature: formatAbiItem(abi.find((abi) => abi.name === functionName)),
          args: args,
        };
      } catch (err) {
        console.error(err);
      }
    }
  }

  return tx;
};
