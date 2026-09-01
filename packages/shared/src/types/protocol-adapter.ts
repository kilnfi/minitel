import type { ReactNode } from 'react';
import type { Protocol } from '../config/protocols';
import type { TransactionVerdict } from './verdict';

export type ManualInputField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'input' | 'select';
  options?: { value: string; label: string }[];
};

export type ProtocolAdapter<TDecodedTransaction> = {
  protocol: Protocol;
  name: string;
  displayName: string;

  parseTransaction: (rawTx: string) => Promise<TDecodedTransaction>;
  computeHash: (rawTx: string) => string | Promise<string>;

  /**
   * Decide whether this transaction is one Kiln produces. Required, not optional: a decoder
   * with no opinion is a decoder that silently vouches for anything. Protocols without an
   * allowlist yet use `pendingAllowlist`, which answers "not checked" rather than nothing.
   */
  classifyTransaction: (data: TDecodedTransaction) => TransactionVerdict;

  renderSummary?: (data: TDecodedTransaction, hash?: string) => ReactNode;

  generateWarnings?: (data: TDecodedTransaction) => Array<{ message: string }>;
  placeholder?: string;

  validateInput?: (rawTx: string) => boolean;

  convertBigInt?: boolean;

  manualInputFields?: ManualInputField[];
  buildTransactionFromFields?: (fields: Record<string, string>) => string;
};
