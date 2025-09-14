import { CopyIcon } from 'lucide-react';
import { solExplorerLink } from '@/utils';

interface AddressLinkProps {
  address: string;
}

export const AddressLink = ({ address }: AddressLinkProps) => {
  const displayAddress = `${address.slice(0, 8)}...${address.slice(-6)}`;

  return (
    <span className="inline-flex items-center gap-1">
      <a
        href={solExplorerLink(address, 'address')}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {displayAddress}
      </a>
      <CopyIcon onClick={() => navigator.clipboard.writeText(address)} className="size-3" />
    </span>
  );
};
