import {
  type AbiItem,
  decodeFunctionData,
  erc20Abi,
  erc4626Abi,
  isAddress,
  isAddressEqual,
  keccak256,
  parseTransaction,
  serializeTransaction,
} from 'viem';
import { formatAbiItem } from 'viem/utils';
import { ABIS, type ContractAbi } from '@/constant';
import type { AugmentedTransaction, AugmentedTransactionWithFunction } from '@/types';
import { normalizeHex } from '@/utils';

const tryDecodeWithAbi = async (tx: AugmentedTransaction, abi: ContractAbi) => {
  if (!tx.data) {
    return null;
  }

  try {
    const { functionName, args } = decodeFunctionData({ abi, data: tx.data });

    const functionAbi = abi.find((item) => item.type === 'function' && item.name === functionName);

    const typedArgs = functionAbi?.inputs
      ? functionAbi.inputs.map((input, index) => ({
          name: input.name || `arg${index}`,
          type: input.type,
          value: String(args[index]),
        }))
      : [];

    return {
      functionName,
      args,
      typedArgs,
      functionSignature: formatAbiItem(
        abi.find((item) => item.type === 'function' && item.name === functionName) as AbiItem,
      ),
    };
  } catch (_error) {
    return null;
  }
};

const tryDecodeInputData = async (tx: AugmentedTransaction) => {
  if (!tx.data || !tx.to) {
    return null;
  }

  const contractAddress = tx.to;
  const matchingAddress = Object.keys(ABIS)
    .filter((addr) => isAddress(addr))
    .find((addr) => isAddressEqual(addr as `0x${string}`, contractAddress)) as keyof typeof ABIS;

  if (matchingAddress) {
    const result = await tryDecodeWithAbi(tx, ABIS[matchingAddress]);
    if (result) {
      return result;
    }
  }

  const erc4626Result = await tryDecodeWithAbi(tx, erc4626Abi);
  if (erc4626Result) {
    return erc4626Result;
  }

  const erc20Result = await tryDecodeWithAbi(tx, erc20Abi);
  if (erc20Result) {
    return erc20Result;
  }

  return null;
};

export const looksLikeObject = (input: string): boolean => {
  return input.startsWith('{') || input.startsWith('[');
};

export const hashEthTx = (txRaw: string): string => {
  if (looksLikeObject(txRaw)) {
    const tx = JSON.parse(txRaw);
    return keccak256(serializeTransaction(tx));
  }

  const hex = normalizeHex(txRaw.trim());
  return keccak256(serializeTransaction(parseTransaction(hex)));
};

export const parseEthTx = async (txRaw: string): Promise<AugmentedTransaction> => {
  try {
    if (looksLikeObject(txRaw)) {
      const tx = JSON.parse(txRaw);
      const inputData = await tryDecodeInputData(tx);
      if (inputData) {
        (tx as AugmentedTransactionWithFunction).inputData = inputData;
      }
      return tx;
    }

    const hex = normalizeHex(txRaw.trim());
    const tx = parseTransaction(hex) as AugmentedTransaction;

    const inputData = await tryDecodeInputData(tx);
    if (inputData) {
      (tx as AugmentedTransactionWithFunction).inputData = inputData;
    }

    return tx;
  } catch (error) {
    throw new Error(
      `Failed to parse Ethereum transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
