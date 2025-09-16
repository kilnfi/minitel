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
  ...buttonProps
}: {
  textToCopy: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<typeof Button>) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          className={cn('gap-2', className)}
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          disabled={disabled}
          {...buttonProps}
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
  wrapperClassName,
}: {
  textToCopy: string;
  disabled?: boolean;
  wrapperClassName?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className={cn(wrapperClassName)}>
      <Tooltip>
        <TooltipTrigger>
          <Button
            size="iconXs"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(textToCopy);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
            disabled={disabled}
          >
            {isCopied ? <CopyCheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
    </div>
  );
};
