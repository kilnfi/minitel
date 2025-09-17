import {
  ArrowRightIcon,
  CoinsIcon,
  FileIcon,
  GitBranchIcon,
  MinusIcon,
  PlusIcon,
  PowerOffIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldIcon,
  SplitIcon,
  StarIcon,
  TriangleAlertIcon,
  UnlockIcon,
  UserIcon,
  ZapIcon,
} from 'lucide-react';
import type { InstructionType } from '@/types';

export function InstructionIcon({
  type,
  hasWarning,
  hasError,
}: {
  type: InstructionType;
  hasWarning?: boolean;
  hasError?: boolean;
}) {
  if (hasError) {
    return <TriangleAlertIcon className="size-4 text-red-600" />;
  }

  const getOperationIcon = () => {
    switch (type) {
      // System Program Instructions
      case 'AdvanceNonceAccount':
        return <ArrowRightIcon className="size-4" />;
      case 'Allocate':
      case 'AllocateWithSeed':
        return <PlusIcon className="size-4" />;
      case 'Assign':
      case 'AssignWithSeed':
        return <UserIcon className="size-4" />;
      case 'AuthorizeNonceAccount':
        return <UnlockIcon className="size-4" />;
      case 'Create':
      case 'CreateWithSeed':
        return <PlusIcon className="size-4" />;
      case 'InitializeNonceAccount':
        return <ZapIcon className="size-4" />;
      case 'Transfer':
      case 'TransferWithSeed':
        return <SendIcon className="size-4" />;
      case 'WithdrawNonceAccount':
        return <MinusIcon className="size-4" />;
      case 'UpgradeNonceAccount':
        return <RefreshCwIcon className="size-4" />;

      // Stake Program Instructions
      case 'Authorize':
      case 'AuthorizeWithSeed':
        return <ShieldIcon className="size-4" />;
      case 'Deactivate':
        return <PowerOffIcon className="size-4" />;
      case 'Delegate':
        return <UserIcon className="size-4" />;
      case 'Initialize':
        return <ZapIcon className="size-4" />;
      case 'Merge':
        return <GitBranchIcon className="size-4" />;
      case 'Split':
        return <SplitIcon className="size-4" />;
      case 'Withdraw':
        return <CoinsIcon className="size-4" />;

      // Unknown/Error cases
      case 'unknown':
        return <FileIcon className="size-4 text-gray-500" />;
      case 'error':
        return <TriangleAlertIcon className="size-4 text-red-600" />;

      default:
        return <StarIcon className="size-4" />;
    }
  };

  if (hasWarning) {
    return (
      <div className="flex gap-1 items-center">
        {getOperationIcon()}
        <TriangleAlertIcon className="size-4 text-yellow-600" />
      </div>
    );
  }

  return getOperationIcon();
}
