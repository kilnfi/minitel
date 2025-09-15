import { CopyCheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';

export const CopyButton = ({
  textToCopy,
  children,
  disabled,
  className,
}: {
  textToCopy: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          className={cn('gap-2', className)}
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          disabled={disabled}
        >
          {isCopied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  );
};

export const CopyButtonIcon = ({
  textToCopy,
  disabled,
  className,
  wrapperClassName,
}: {
  textToCopy: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className={cn(wrapperClassName)}>
      <Tooltip>
        <TooltipTrigger>
          <Button
            className={cn('size-5', className)}
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(textToCopy);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
            disabled={disabled}
          >
            {isCopied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
    </div>
  );
};
