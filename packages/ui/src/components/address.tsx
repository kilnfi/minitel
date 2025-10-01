import { CopyCheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type Props = {
  address: string;
  explorerLink?: string;
  className?: string;
  showCopy?: boolean;
};

export const Address = ({ address, explorerLink, className = '', showCopy = true }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const copyButton = (
    <button onClick={handleCopy} type="button">
      {isCopied ? <CopyCheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
    </button>
  );

  return (
    <div className="flex items-center gap-1 px-1">
      {explorerLink ? (
        <a href={explorerLink} target="_blank" rel="noreferrer" className={twMerge('underline', className)}>
          {address.slice(0, 8)}...{address.slice(-6)}
        </a>
      ) : (
        <>
          {address.slice(0, 8)}...{address.slice(-6)}
        </>
      )}
      {showCopy && (
        <Tooltip>
          <TooltipTrigger asChild>{copyButton}</TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
