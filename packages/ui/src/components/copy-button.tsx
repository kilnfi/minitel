import type { VariantProps } from 'class-variance-authority';
import { CopyCheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { Button, type buttonVariants } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const CopyButtonIcon = ({
  textToCopy,
  disabled,
  variant = 'ghost',
  size = 'iconXs',
}: {
  textToCopy: string;
  disabled?: boolean;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size={size}
          variant={variant}
          onClick={() => {
            navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
          disabled={disabled}
        >
          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  );
};
