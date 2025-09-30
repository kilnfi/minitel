import { Address, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@protocols/ui';
import { AlertTriangleIcon, ArrowLeftRightIcon, FuelIcon, UserIcon } from 'lucide-react';
import type { DecodedAction, NearTransaction } from '@/parser';

type TransactionSummaryProps = {
  transaction: NearTransaction;
};

const formatNearAmount = (yoctoNear: string): string => {
  return (Number(yoctoNear) / 1e24).toFixed(6);
};

const formatGas = (gas: string): string => {
  return (Number(gas) / 1e12).toFixed(2);
};

const getActionLabel = (action: DecodedAction): string => {
  switch (action.type) {
    case 'functionCall':
      if (action.stakingOperation === 'stake') return 'Function Call : Stake';
      if (action.stakingOperation === 'unstake') return 'Function Call : Unstake';
      if (action.stakingOperation === 'withdraw') return 'Function Call : Withdraw';
      return `Function Call: ${action.methodName}`;
    case 'transfer':
      return 'Transfer';
    case 'createAccount':
      return 'Create Account';
    case 'deleteAccount':
      return 'Delete Account';
    case 'addKey':
      return 'Add Key';
    case 'deleteKey':
      return 'Delete Key';
    case 'deployContract':
      return 'Deploy Contract';
    case 'stake':
      return 'Native Stake';
    case 'unsupported':
      return 'Unsupported Action';
    default:
      return 'Unknown';
  }
};

const isExpectedStakingAction = (action: DecodedAction): boolean => {
  return action.type === 'functionCall' && action.stakingOperation !== null;
};

const getActionDetails = (action: DecodedAction): string => {
  switch (action.type) {
    case 'functionCall':
      return `${action.methodName}(${Object.keys(action.args).length > 0 ? JSON.stringify(action.args) : ''})`;
    case 'transfer':
      return 'Direct NEAR transfer';
    case 'deleteAccount':
      return `Beneficiary: ${action.beneficiaryId}`;
    case 'addKey':
    case 'deleteKey':
      return `Key: ${action.publicKey.substring(0, 20)}...`;
    case 'deployContract':
      return `Code size: ${action.codeSize} bytes`;
    case 'stake':
      return `Key: ${action.publicKey.substring(0, 20)}...`;
    case 'createAccount':
      return 'Create new account';
    case 'unsupported':
      return 'Unknown action';
    default:
      return '-';
  }
};

const getActionValue = (action: DecodedAction): string => {
  switch (action.type) {
    case 'transfer':
      return `${formatNearAmount(action.amount)} NEAR`;
    case 'functionCall':
      return Number(action.deposit) > 0 ? `${formatNearAmount(action.deposit)} NEAR` : '-';
    case 'stake':
      return `${formatNearAmount(action.amount)} NEAR`;
    default:
      return '-';
  }
};

export function TransactionSummary({ transaction }: TransactionSummaryProps) {
  if (!transaction || transaction.actions.length === 0) return null;

  const primaryAction = transaction.actions[0];
  const hasUnexpectedActions = transaction.actions.some((action) => !isExpectedStakingAction(action));

  const totalValue = transaction.actions.reduce((sum, action) => {
    if (action.type === 'transfer') return sum + Number(action.amount);
    if (action.type === 'functionCall') return sum + Number(action.deposit);
    if (action.type === 'stake') return sum + Number(action.amount);
    return sum;
  }, 0);

  const totalNear = formatNearAmount(totalValue.toString());

  return (
    <div className="flex flex-col gap-7">
      {hasUnexpectedActions && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-2">
          <AlertTriangleIcon className="size-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            This transaction contains unexpected actions! Review carefully before signing.
          </span>
        </div>
      )}

      <div className="flex items-center">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">Total NEAR Value</span>
          <span className="text-2xl">{totalNear} NEAR</span>
        </div>
        <div className="w-[1px] h-16 bg-secondary mx-10" />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">To Address</span>
          <span className="text-2xl">
            <Address address={transaction.receiverId} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <span className="text-sm text-muted-foreground">From</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Address address={transaction.signerId} />
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm truncate whitespace-nowrap">Action Type</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant={isExpectedStakingAction(primaryAction) ? 'success' : 'destructive'}>
                {getActionLabel(primaryAction)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Actions Count</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l overflow-auto flex-1 w-full bg-secondary/10">
              <span className="text-sm font-mono">{transaction.actions.length}</span>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <FuelIcon className="size-4" />
                <span className="text-sm">Gas</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant="success">
                {primaryAction.type === 'functionCall' ? `${formatGas(primaryAction.gas)} TGas` : 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start">
        <span className="font-medium uppercase">Actions Details</span>

        <Table>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>Action Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaction.actions.map((action, index) => (
              <TableRow key={index} className={!isExpectedStakingAction(action) ? 'bg-destructive/5' : ''}>
                <TableCell>
                  <Badge variant={isExpectedStakingAction(action) ? 'success' : 'destructive'}>
                    {getActionLabel(action)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{getActionDetails(action)}</TableCell>
                <TableCell className="text-right font-mono">{getActionValue(action)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 items-start">
        <span className="font-medium uppercase">Technical Details</span>

        <Table>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Public Key</TableCell>
              <TableCell className="text-right break-all font-mono text-xs">{transaction.publicKey}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nonce</TableCell>
              <TableCell className="text-right font-mono">{transaction.nonce}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Block Hash</TableCell>
              <TableCell className="text-right break-all font-mono text-xs">{transaction.blockHash}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
