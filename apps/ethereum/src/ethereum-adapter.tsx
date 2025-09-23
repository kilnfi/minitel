import type { ProtocolAdapter } from '@protocols/shared';
import { formatEther } from 'viem';
import { TransactionSummary } from '@/components/TransactionSummary';
import { hashEthTx, parseEthTx } from '@/parser';
import type { AugmentedTransaction } from '@/types';
import { getActionDescription } from '@/utils';

export const ethereumAdapter: ProtocolAdapter<AugmentedTransaction> = {
  name: 'ethereum',
  displayName: 'Ethereum',
  placeholder: 'Paste your transaction as hex',
  parseTransaction: parseEthTx,
  computeHash: hashEthTx,

  renderSummary: (data, hash) => <TransactionSummary transaction={data} hash={hash ?? ''} />,

  generateWarnings: (data) => {
    const valueWei = data.value ?? 0n;
    const ethAmount = formatEther(valueWei);
    const isHighValue = Number(ethAmount) > 1;
    const warnings = [
      { message: getActionDescription(data).warning },
      ...(isHighValue ? [{ message: `High value transaction: ${ethAmount} ETH` }] : []),
    ];
    return warnings;
  },
};
