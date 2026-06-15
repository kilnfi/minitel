import { Address, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@protocols/ui';
import { AlertTriangleIcon, ArrowLeftRightIcon, FuelIcon, UserIcon } from 'lucide-react';
import type { CosmosCoin, CosmosMessage, CosmosTransaction } from './parser';

type CosmosTransactionSummaryProps = {
  transaction: CosmosTransaction;
};

// Message kinds that are the expected, benign output of a staking dashboard.
const EXPECTED_KINDS: ReadonlySet<CosmosMessage['kind']> = new Set(['delegate', 'undelegate', 'withdrawRewards']);

const isExpectedMessage = (message: CosmosMessage): boolean => EXPECTED_KINDS.has(message.kind);

const getMessageLabel = (message: CosmosMessage): string => {
  switch (message.kind) {
    case 'delegate':
      return 'Delegate';
    case 'undelegate':
      return 'Undelegate';
    case 'redelegate':
      return 'Redelegate';
    case 'withdrawRewards':
      return 'Withdraw Rewards';
    case 'send':
      return 'Send';
    case 'authzGrant':
      return 'Authz Grant';
    case 'authzExec':
      return 'Authz Exec';
    case 'authzRevoke':
      return 'Authz Revoke';
    case 'unsupported':
      return 'Unsupported';
    default:
      return 'Unknown';
  }
};

const formatCoin = (coin: CosmosCoin | null): string => (coin ? `${coin.amount} ${coin.denom}` : '-');

const formatCoins = (coins: CosmosCoin[]): string =>
  coins.length > 0 ? coins.map((coin) => `${coin.amount} ${coin.denom}`).join(', ') : '-';

const getMessageValidator = (message: CosmosMessage): string => {
  switch (message.kind) {
    case 'delegate':
    case 'undelegate':
    case 'withdrawRewards':
      return message.validatorAddress;
    case 'redelegate':
      return `${message.validatorSrcAddress} → ${message.validatorDstAddress}`;
    default:
      return '-';
  }
};

const getMessageAccount = (message: CosmosMessage): string => {
  switch (message.kind) {
    case 'delegate':
    case 'undelegate':
    case 'redelegate':
    case 'withdrawRewards':
      return message.delegatorAddress;
    case 'send':
      return message.fromAddress;
    case 'authzGrant':
    case 'authzRevoke':
      return message.granter;
    case 'authzExec':
      return message.grantee;
    default:
      return '-';
  }
};

const getMessageAmount = (message: CosmosMessage): string => {
  switch (message.kind) {
    case 'delegate':
    case 'undelegate':
    case 'redelegate':
      return formatCoin(message.amount);
    case 'send':
      return formatCoins(message.amount);
    default:
      return '-';
  }
};

const getMessageDetails = (message: CosmosMessage): string => {
  switch (message.kind) {
    case 'delegate':
    case 'undelegate':
      return `Validator: ${message.validatorAddress}`;
    case 'redelegate':
      return `${message.validatorSrcAddress} → ${message.validatorDstAddress}`;
    case 'withdrawRewards':
      return `Validator: ${message.validatorAddress}`;
    case 'send':
      return `To: ${message.toAddress}`;
    case 'authzGrant':
      return `Grantee: ${message.grantee} (${message.authorizationType})`;
    case 'authzExec':
      return `Nested: ${message.innerTypeUrls.join(', ') || 'none'}`;
    case 'authzRevoke':
      return `Grantee: ${message.grantee} (${message.msgTypeUrl})`;
    case 'unsupported':
      return message.typeUrl || 'unknown type';
    default:
      return '-';
  }
};

export function CosmosTransactionSummary({ transaction }: CosmosTransactionSummaryProps) {
  if (!transaction || transaction.messages.length === 0) return null;

  const primaryMessage = transaction.messages[0];
  const hasUnexpectedMessages = transaction.messages.some((message) => !isExpectedMessage(message));

  return (
    <div className="flex flex-col gap-7">
      {hasUnexpectedMessages && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-center gap-2">
          <AlertTriangleIcon className="size-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            This transaction contains unexpected messages! Review carefully before signing.
          </span>
        </div>
      )}

      <div className="flex items-center">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">Primary Amount</span>
          <span className="text-2xl">{getMessageAmount(primaryMessage)}</span>
        </div>
        <div className="w-[1px] h-16 bg-secondary mx-10" />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-muted-foreground text-sm">Validator</span>
          <span className="text-2xl">
            {getMessageValidator(primaryMessage) === '-' ? (
              '-'
            ) : (
              <Address address={getMessageValidator(primaryMessage)} />
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Delegator</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              {getMessageAccount(primaryMessage) === '-' ? (
                '-'
              ) : (
                <Address address={getMessageAccount(primaryMessage)} />
              )}
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm truncate whitespace-nowrap">Message Type</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant={isExpectedMessage(primaryMessage) ? 'success' : 'destructive'}>
                {getMessageLabel(primaryMessage)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-t-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeftRightIcon className="size-4" />
                <span className="text-sm text-muted-foreground">Messages Count</span>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
            <div className="p-3 border-l overflow-auto flex-1 w-full bg-secondary/10">
              <span className="text-sm font-mono">{transaction.messages.length}</span>
            </div>
          </div>
          <div className="rounded-b-lg overflow-hidden border flex md:flex-row flex-col">
            <div className="flex w-full md:w-2/5 bg-secondary justify-between items-center p-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <FuelIcon className="size-4" />
                <span className="text-sm">Fee</span>
              </div>
              <span className="text-sm">-</span>
            </div>
            <div className="p-3 border-l flex-1 w-full bg-secondary/10">
              <Badge variant="success">{transaction.fee ? formatCoins(transaction.fee.amount) : 'N/A'}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start">
        <span className="font-medium uppercase">Messages</span>

        <Table>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>Message Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaction.messages.map((message, index) => (
              <TableRow key={index} className={!isExpectedMessage(message) ? 'bg-destructive/5' : ''}>
                <TableCell>
                  <Badge variant={isExpectedMessage(message) ? 'success' : 'destructive'}>
                    {getMessageLabel(message)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs break-all">{getMessageDetails(message)}</TableCell>
                <TableCell className="text-right font-mono">{getMessageAmount(message)}</TableCell>
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
              <TableCell>Memo</TableCell>
              <TableCell className="text-right break-all font-mono text-xs">{transaction.memo || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fee</TableCell>
              <TableCell className="text-right break-all font-mono text-xs">
                {transaction.fee ? formatCoins(transaction.fee.amount) : '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gas Limit</TableCell>
              <TableCell className="text-right font-mono">{transaction.fee?.gasLimit ?? '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
