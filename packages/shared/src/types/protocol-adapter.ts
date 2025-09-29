import type { ReactNode } from 'react';

export type ProtocolAdapter<TDecodedTransaction> = {
  name: string;
  displayName: string;

  parseTransaction: (rawTx: string) => Promise<TDecodedTransaction>;
  computeHash: (rawTx: string) => string | Promise<string>;

  renderSummary: (data: TDecodedTransaction, hash?: string) => ReactNode;

  generateWarnings: (data: TDecodedTransaction) => Array<{ message: string }>;
  placeholder?: string;
};
