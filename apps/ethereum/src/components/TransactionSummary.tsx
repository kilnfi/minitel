import {
  Address,
  Badge,
  Card,
  CardContent,
  CopyButtonIcon,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@protocols/ui';
import { ArrowLeftRightIcon, FuelIcon, ShrinkIcon, TriangleAlertIcon } from 'lucide-react';
import { formatEther, formatGwei } from 'viem';
import type { AugmentedTransaction } from '@/types';
import { ethExplorerLink, getActionDescription } from '@/utils';

interface TransactionSummaryProps {
  transaction: AugmentedTransaction;
  hash: string;
}

export function TransactionSummary({ transaction, hash }: TransactionSummaryProps) {
  if (!transaction) return null;

  const actionDetails = getActionDescription(transaction);
  const riskLevel = actionDetails.riskLevel;
  const ethValue = formatEther(transaction.value ?? 0n);
  const maxFeeGwei = formatGwei(transaction.maxFeePerGas ?? 0n);

  return (
    <Card className="p-6 space-y-4">
      <CardContent className="flex flex-wrap gap-4">
        <div className="space-y-3 flex-1 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Risk Level</div>
            <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'warning' : 'success'}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Transaction Type</div>
            <Badge variant="success">
              {'inputData' in transaction && transaction.inputData?.functionName
                ? transaction.inputData.functionName
                : 'Unknown'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Action</div>
            <div className="font-medium text-sm">{actionDetails.description}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">ETH Amount</div>
            <div className="font-medium text-sm">{ethValue} ETH</div>
          </div>
        </div>

        <div className="space-y-3 flex-1 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">To Address</div>
            <div className="font-mono text-sm">
              <Address
                address={transaction.to ?? '0x0000000000000000000000000000000000000000'}
                explorerLink={ethExplorerLink(transaction.to ?? '', 'address')}
                className="text-blue-600 hover:text-blue-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Max Fee</div>
            <div className="font-medium text-sm">{maxFeeGwei} Gwei</div>
          </div>

          {hash && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Transaction Hash</div>
              <div className="font-mono text-sm">
                <Address
                  address={hash}
                  explorerLink={ethExplorerLink(hash, 'tx')}
                  className="text-blue-600 hover:text-blue-800"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {'inputData' in transaction && transaction.inputData?.functionSignature && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <span className="text-xl font-semibold">Function Called</span>
            <pre className="relative bg-secondary rounded-md px-4 py-3.5 font-mono text-sm overflow-x-auto">
              <code>{transaction.inputData.functionSignature}</code>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CopyButtonIcon
                  textToCopy={transaction.inputData.functionSignature}
                  disabled={!transaction.inputData.functionSignature}
                />
              </div>
            </pre>
          </CardContent>
        </Card>
      )}
      {'inputData' in transaction && transaction.inputData?.typedArgs && transaction.inputData.typedArgs.length > 0 && (
        <Table>
          <TableCaption>Input Data</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaction.inputData.typedArgs.map((arg, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{arg.name}</TableCell>
                <TableCell>{arg.type}</TableCell>
                <TableCell className="text-right break-all">{arg.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

export function TransactionSummaryNew({ transaction, hash }: TransactionSummaryProps) {
  if (!transaction) return null;

  const actionDetails = getActionDescription(transaction);
  const riskLevel = actionDetails.riskLevel;
  const ethValue = formatEther(transaction.value ?? 0n);
  const maxFeeGwei = formatGwei(transaction.maxFeePerGas ?? 0n);
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">ETH Amount</span>
          <span className="text-2xl">{ethValue} ETH</span>
        </div>
        <div className="w-[1px] h-16 bg-gray-200 mx-10" />
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
          <div className="rounded-t-lg overflow-hidden border flex">
            <div className="flex flex-1 bg-gray-50 justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <TriangleAlertIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Risk level</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l flex-1 bg-white">
              <Badge variant="destructive">{riskLevel.toUpperCase()} RISK</Badge>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex">
            <div className="flex flex-1 bg-gray-50 justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm">Transaction type</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 bg-white">
              <Badge variant="success">Approval</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex">
            <div className="flex flex-1 bg-gray-50 justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShrinkIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Action</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l min-w-1/2 flex-1 bg-white">
              <span className="text-sm text-nowrap truncate">{actionDetails.description}</span>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex">
            <div className="flex flex-1 bg-gray-50 justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <FuelIcon className="size-4" />
                <span className="text-sm">Max fee</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 bg-white">
              <Badge variant="success">{maxFeeGwei} Gwei</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="font-medium uppercase">technical details</span>
      </div>
    </div>
  );
}
