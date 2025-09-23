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
