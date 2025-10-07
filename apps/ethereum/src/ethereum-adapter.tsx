import { ETH, type ProtocolAdapter } from '@protocols/shared';
import { formatEther } from 'viem';
import * as viemChains from 'viem/chains';
import { TransactionSummary } from '@/components/TransactionSummary';
import { hashEthTx, parseEthTx } from '@/parser';
import type { AugmentedTransaction } from '@/types';
import { getActionDetails } from '@/utils';

export const buildEthTransactionFromFields = (fields: Record<string, string>) => {
  const txObject: Record<string, string> = {};
  if (fields.data) txObject.data = fields.data;
  if (fields.to) txObject.to = fields.to;
  if (fields.from) txObject.from = fields.from;
  if (fields.value) txObject.value = fields.value;
  if (fields.chainId) txObject.chainId = fields.chainId;
  txObject.nonce = '0';
  txObject.maxPriorityFeePerGas = '2000000000';
  txObject.maxFeePerGas = '50000000000';
  txObject.gas = '21000';
  txObject.authorizationList = '';
  return JSON.stringify(txObject);
};

const chains = Object.values(viemChains).map((chain) => ({
  value: chain.id.toString(),
  label: `${chain.id.toString()} - ${chain.name}`,
}));

export const ethereumAdapter: ProtocolAdapter<AugmentedTransaction> = {
  protocol: ETH,
  name: 'ethereum',
  displayName: 'Ethereum',
  placeholder: 'Paste your transaction as hex or JSON',
  parseTransaction: parseEthTx,
  computeHash: hashEthTx,
  renderSummary: (data) => <TransactionSummary transaction={data} />,

  manualInputFields: [
    { key: 'data', label: 'Calldata (hex)', placeholder: '0x...' },
    { key: 'to', label: 'To Address', placeholder: '0x...' },
    { key: 'from', label: 'From Address', placeholder: '0x...' },
    { key: 'value', label: 'Value (Wei)', placeholder: '0' },
    { key: 'chainId', type: 'select', options: chains, label: 'Chain ID', placeholder: '1' },
  ],
  buildTransactionFromFields: buildEthTransactionFromFields,

  generateWarnings: (data) => {
    const valueWei = data.value ?? 0n;
    const ethAmount = formatEther(valueWei);
    const isHighValue = Number(ethAmount) > 1;
    const warnings = [
      { message: getActionDetails(data).warning },
      ...(isHighValue ? [{ message: `High value transaction: ${ethAmount} ETH` }] : []),
    ];
    return warnings;
  },
};
