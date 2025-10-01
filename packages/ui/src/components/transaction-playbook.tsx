import type { PlaybookConfig, PlaybookOperationOverviewItem, PlaybookStepByStepItem } from '@protocols/shared';
import {
  CodeIcon,
  InfoIcon,
  KeyRoundIcon,
  ListChecksIcon,
  ListIcon,
  ListIndentDecreaseIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIsDarkMode } from '../hooks/useIsDarkMode';
import { useTransactionDecoder } from '../hooks/useTransactionDecoder';
import { cn } from '../lib/utils';
import { TransactionDecoderTabs } from './transaction-decoder';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type TransactionPlaybookProps<T> = {
  config: PlaybookConfig<T>;
  isOpen: boolean;
  onClose: () => void;
};

const renderOperationOverview = (items: PlaybookOperationOverviewItem[]) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <p key={index} className="text-muted-foreground">
          {item.content}
        </p>
      ))}
    </div>
  );
};

const renderStepByStep = (steps: PlaybookStepByStepItem[]) => {
  return (
    <Accordion
      type="multiple"
      className="space-y-6 *:border-b-0 [&_[data-slot=accordion-trigger]]:py-0 [&_[data-slot=accordion-trigger]]:no-underline"
    >
      {steps.map((step, index) => (
        <AccordionItem key={`step-${index}`} value={`step-${index}`}>
          <AccordionTrigger className="text-sm">
            {step.program ? (
              <div className="flex items-center gap-2 w-full">
                <div className="w-4 h-4 bg-foreground text-background flex items-center justify-center text-[10px] rounded-full">
                  {index + 1}
                </div>
                {step.title}
                <hr className="flex-1" />
                <Badge variant="secondary">{step.program}</Badge>
              </div>
            ) : (
              `${index + 1}. ${step.title}`
            )}
          </AccordionTrigger>
          <AccordionContent className="pt-3 pb-0 text-muted-foreground">{step.description}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export function TransactionPlaybook<T>({ config, isOpen, onClose }: TransactionPlaybookProps<T>) {
  const isDarkMode = useIsDarkMode();
  const { decodedTransaction, hash, decodeTransaction } = useTransactionDecoder<T>(config.adapter);

  const playbookRef = useRef<HTMLDivElement>(null);
  const stepByStepRef = useRef<HTMLDivElement>(null);
  const operationOverviewRef = useRef<HTMLDivElement>(null);
  const decodedTransactionRef = useRef<HTMLDivElement>(null);

  const [selectedOperation, setSelectedOperation] = useState<string>(config.operations[0]?.value || '');

  const selectedOperationData = config.operations.find((operation) => operation.value === selectedOperation);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <config is static>
  useEffect(() => {
    decodeTransaction(config.operations[0].rawTransaction);
  }, [decodeTransaction]);

  return (
    <div
      ref={playbookRef}
      className={cn(
        'fixed right-0 top-0 bottom-0 border-l bg-secondary transition-all duration-300 ease-in-out overflow-auto z-50',
        isOpen ? 'w-full md:w-[40%]' : 'w-0',
      )}
    >
      <div className="px-4 py-7 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">{config.protocolName} decode playbook</h2>
            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={onClose}
              className="md:hidden"
              aria-label="Close playbook"
            >
              <XIcon className="size-5" />
            </Button>
          </div>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent className="text-pretty max-w-[320px]">
                These are sample transactions for learning. They're not your transaction. Use the section on the left to
                decode your transactions.
              </TooltipContent>
            </Tooltip>
            Example mode - read only
          </span>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Choose operation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={selectedOperation}
                onValueChange={(value) => {
                  setSelectedOperation(value);
                  const operation = config.operations.find((op) => op.value === value);
                  if (operation?.rawTransaction) {
                    decodeTransaction(operation.rawTransaction);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an operation" />
                </SelectTrigger>
                <SelectContent>
                  {config.operations.map((operation) => (
                    <SelectItem key={operation.value} value={operation.value}>
                      {operation.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="p-3 border rounded-md space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs font-semibold">
                  <ListIndentDecreaseIcon className="size-4" />
                  Raw transaction
                </div>
                <p className="text-muted-foreground text-sm break-all max-h-32 h-auto overflow-y-auto">
                  {selectedOperationData?.rawTransaction}
                </p>
              </div>

              <div className="p-3 border rounded-md space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs font-semibold">
                  <KeyRoundIcon className="size-4" />
                  Transaction hash
                </div>
                <p className="text-muted-foreground text-sm break-all">{hash}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedOperationData && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Playbook output breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                onValueChange={(value) => {
                  if (!value) return;
                  setTimeout(() => {
                    if (value === 'operation-overview') {
                      playbookRef.current?.scrollTo({
                        top: (operationOverviewRef.current?.offsetTop ?? 0) - 100,
                        behavior: 'smooth',
                      });
                    } else if (value === 'step-by-step') {
                      playbookRef.current?.scrollTo({
                        top: (stepByStepRef.current?.offsetTop ?? 0) - 100,
                        behavior: 'smooth',
                      });
                    } else {
                      playbookRef.current?.scrollTo({
                        top: Math.max((decodedTransactionRef.current?.offsetTop ?? 0) - 100, 0),
                        behavior: 'smooth',
                      });
                    }
                  }, 200);
                }}
              >
                <AccordionItem value="decoded-data">
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <CodeIcon className="size-4" />
                      Decoded transaction data
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div ref={decodedTransactionRef} />
                    <TransactionDecoderTabs
                      renderSummary={
                        config.adapter.renderSummary
                          ? (data: T) => config.adapter.renderSummary?.(data, hash)
                          : undefined
                      }
                      decodedTransaction={decodedTransaction}
                      isDarkMode={isDarkMode}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="operation-overview">
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <ListIcon className="size-4" />
                      Operation overview
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div ref={operationOverviewRef} />
                    {renderOperationOverview(selectedOperationData.operationOverview)}
                  </AccordionContent>
                </AccordionItem>

                {selectedOperationData?.stepByStep && (
                  <AccordionItem value="step-by-step">
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <ListChecksIcon className="size-4" />
                        Step-by-step operation
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div ref={stepByStepRef} />
                      {renderStepByStep(selectedOperationData.stepByStep)}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
