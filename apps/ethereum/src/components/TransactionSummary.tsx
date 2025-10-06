import {
  Address,
  Badge,
  CopyButtonIcon,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@protocols/ui';
import { ArrowLeftRightIcon, FuelIcon, ShrinkIcon, TriangleAlertIcon } from 'lucide-react';
import { formatEther, formatGwei } from 'viem';
import type { AugmentedTransaction } from '@/types';
import { ethExplorerLink, getActionDetails } from '@/utils';

type TransactionSummaryProps = {
  transaction: AugmentedTransaction;
};

export function TransactionSummary({ transaction }: TransactionSummaryProps) {
  if (!transaction) return null;

  const actionDetails = getActionDetails(transaction);
  const riskLevel = actionDetails.riskLevel;
  const ethValue = formatEther(BigInt(transaction.value ?? 0n));
  const maxFeeGwei = Number(formatGwei(transaction.maxFeePerGas ?? 0n)).toFixed(2);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">ETH Amount</span>
          <span className="text-2xl">{ethValue} ETH</span>
        </div>
        <div className="w-[1px] h-16 bg-secondary mx-10" />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">To Address</span>
          <span className="text-2xl">
            <Address
              address={transaction.to ?? '0x0000000000000000000000000000000000000000'}
              explorerLink={ethExplorerLink(transaction.to ?? '', 'address')}
            />
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <TriangleAlertIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Risk level</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant="destructive">{riskLevel.toUpperCase()} RISK</Badge>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm truncate whitespace-nowrap">Transaction type</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant="success">Approval</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShrinkIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Action</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l overflow-auto flex-1 w-full bg-secondary/10">
              <span className="text-sm text-nowrap truncate">{actionDetails.description}</span>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <FuelIcon className="size-4" />
                <span className="text-sm">Max fee</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant="success">{maxFeeGwei} Gwei</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <span className="font-medium uppercase">technical details</span>
        {'inputData' in transaction && transaction.inputData?.functionSignature && (
          <div
            className={cn(
              'flex items-center gap-2 bg-transparent dark:bg-input/30 rounded-md p-2 text-sm border border-input',
              transaction.inputData?.functionSignature ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <Badge variant="secondary">Function called</Badge>
            <span className="text-xs truncate">{transaction.inputData?.functionSignature ?? 'No function called'}</span>
            <CopyButtonIcon
              textToCopy={transaction.inputData?.functionSignature ?? ''}
              disabled={!transaction.inputData?.functionSignature}
            />
          </div>
        )}
        {'inputData' in transaction &&
          transaction.inputData?.typedArgs &&
          transaction.inputData.typedArgs.length > 0 && (
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.inputData.typedArgs.map((arg, index) => (
                  <TableRow key={index}>
                    <TableCell>{index}</TableCell>
                    <TableCell>{arg.name}</TableCell>
                    <TableCell>{arg.type}</TableCell>
                    <TableCell className="text-right break-all">{arg.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>
    </div>
  );
}
