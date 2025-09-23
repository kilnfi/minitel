import type {
  Abi,
  ContractFunctionArgs,
  ContractFunctionName,
  TransactionSerializableEIP7702,
  TransactionSerializableLegacy,
} from 'viem';

type Transaction = TransactionSerializableLegacy | TransactionSerializableEIP7702;

export type TypedArg = {
  name: string;
  type: string;
  value: string;
};

export type AugmentedTransactionWithFunction<TFunctionName extends string = string> = Transaction & {
  inputData: {
    functionName: TFunctionName;
    functionSignature: string;
    args: readonly unknown[];
    typedArgs: TypedArg[];
  };
};

export type ExtractArgs<TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>> = ContractFunctionArgs<
  TAbi,
  'payable' | 'nonpayable',
  TFunctionName
>;

export type AugmentedTransaction = Transaction | AugmentedTransactionWithFunction;
