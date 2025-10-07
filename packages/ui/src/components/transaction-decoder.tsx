import type { ManualInputField, Protocol } from '@protocols/shared';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  InboxIcon,
  InfoIcon,
  TriangleAlertIcon,
  ZapIcon,
} from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useIsDarkMode } from '../hooks/useIsDarkMode';
import { cn, convertBigIntToString } from '../lib/utils';
import { CopyButtonIcon } from './copy-button';
import { Footer } from './footer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export type TransactionDecoderProps<T> = {
  title?: string;
  subtitle?: string;
  rawTransaction: string;
  onRawTransactionChange: (value: string) => void;
  onDecode: () => void;
  decodedTransaction: T | null;
  hash?: string;
  warnings?: Array<{ message: string }>;
  renderSummary?: (data: T) => React.ReactNode;
  placeholder?: string;
  error?: string;
  protocol: Protocol;
  isManualMode?: boolean;
  onManualModeChange?: (enabled: boolean) => void;
  manualFields?: Record<string, string>;
  manualInputFieldsConfig?: ManualInputField[];
  onManualFieldChange?: (field: string, value: string) => void;
};

export function TransactionDecoder<T>({
  title = 'Transaction decoder',
  subtitle = 'Decode and analyze transactions',
  rawTransaction,
  onRawTransactionChange,
  onDecode,
  decodedTransaction,
  hash,
  warnings = [],
  renderSummary,
  placeholder = 'Paste your transaction as hex or JSON',
  error,
  isManualMode = false,
  onManualModeChange,
  manualFields,
  manualInputFieldsConfig,
  onManualFieldChange,
}: TransactionDecoderProps<T>) {
  const textareaId = useId();
  const manualModeId = useId();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const warningsAmount = warnings.length;
  const isDarkMode = useIsDarkMode();
  const supportsManualInput = !!manualInputFieldsConfig && manualInputFieldsConfig.length > 0;

  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    if (!manualInputFieldsConfig) return {};
    return manualInputFieldsConfig.reduce(
      (acc, field) => {
        if (field.type === 'select') {
          acc[field.key] = false;
        }
        return acc;
      },
      {} as Record<string, boolean>,
    );
  });

  return (
    <div className="relative flex flex-col gap-4 items-center justify-center px-4 w-full">
      <div className="flex flex-col items-center gap-y-8 py-8 w-full">
        <div className="gap-4 text-foreground flex flex-col items-center justify-center text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-4 max-w-5xl w-full mx-auto">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">
                  {isManualMode ? 'Enter transaction fields' : 'Paste your raw transaction'}
                </span>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline">
                        <InfoIcon />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Raw transaction decoder</DialogTitle>
                        <DialogDescription>
                          Decode a raw transaction hex string to gain insights into transaction details before signing.
                          Decoding reveals important information such as sender and recipient addresses, gas price, and
                          decoded inputs. <br />
                          <br />
                          Running the decoder also generates the transaction hash, allowing you to verify that you're
                          actually signing what you intend to sign.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {supportsManualInput && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={manualModeId}
                    checked={isManualMode}
                    onChange={(e) => onManualModeChange?.(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  />
                  <label htmlFor={manualModeId} className="text-sm font-medium leading-none cursor-pointer">
                    Enter transaction fields separately
                  </label>
                </div>
              )}

              <div className="grid w-full gap-3">
                {isManualMode ? (
                  <div className="grid gap-4">
                    {manualInputFieldsConfig?.map((fieldConfig) => (
                      <div key={fieldConfig.key} className="grid gap-2">
                        {fieldConfig.type === 'select' ? (
                          <div className="space-y-2">
                            <Label>{fieldConfig.label}</Label>
                            <Popover
                              open={openStates[fieldConfig.key]}
                              onOpenChange={(open) => {
                                setOpenStates((prev) => ({
                                  ...prev,
                                  [fieldConfig.key]: open,
                                }));
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                  {manualFields?.[fieldConfig.key]
                                    ? fieldConfig.options?.find(
                                        (option) => option.value === manualFields[fieldConfig.key],
                                      )?.label
                                    : fieldConfig.placeholder}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder={`Search ${fieldConfig.label.toLowerCase()}...`} />
                                  <CommandList>
                                    <CommandEmpty>No options found.</CommandEmpty>
                                    <CommandGroup>
                                      {fieldConfig.options?.map((option, i) => (
                                        <CommandItem
                                          key={`${i}-${option.value}`}
                                          value={option.label}
                                          onSelect={(currentValue) => {
                                            onManualFieldChange?.(
                                              fieldConfig.key,
                                              fieldConfig.options?.find((option) => option.label === currentValue)
                                                ?.value ?? '',
                                            );
                                            // Close only this specific popover
                                            setOpenStates((prev) => ({
                                              ...prev,
                                              [fieldConfig.key]: false,
                                            }));
                                          }}
                                        >
                                          <CheckIcon
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              manualFields?.[fieldConfig.key] === option.label
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                            )}
                                          />
                                          {option.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ) : (
                          <>
                            <Label>
                              {fieldConfig.label}
                              {fieldConfig.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            <Input
                              placeholder={fieldConfig.placeholder}
                              value={manualFields?.[fieldConfig.key] ?? ''}
                              onChange={(e) => onManualFieldChange?.(fieldConfig.key, e.target.value)}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    className="h-20 overflow-auto resize-y"
                    placeholder={placeholder}
                    id={textareaId}
                    value={rawTransaction}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onRawTransactionChange(e.target.value)}
                    ref={textAreaRef}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className="transition-transform active:scale-95 active:opacity-80"
                disabled={
                  isManualMode
                    ? !manualInputFieldsConfig?.some((field) => field.required && manualFields?.[field.key]?.trim())
                    : !rawTransaction
                }
                size="lg"
                onClick={onDecode}
              >
                <ZapIcon className="w-4 h-4" /> Run
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-4 items-center w-full justify-between">
                <span className="text-xl font-semibold">Output</span>
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div
                    className={cn(
                      'flex items-center gap-2 bg-transparent dark:bg-input/30 rounded-md p-2 text-sm border border-input min-w-0',
                      hash ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary">
                          <InfoIcon />
                          Transaction hash
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[360px] w-full">
                        <p className="text-pretty text-center w-full">
                          Hash computed from the inputed raw transaction hex string. Compare this with your wallet’s
                          prompt to ensure you’re signing the exact bytes you decoded.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs truncate">
                      {hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : 'No transaction hash yet'}
                    </span>
                    <CopyButtonIcon textToCopy={hash ?? ''} disabled={!hash} />
                  </div>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>Error decoding transaction</AlertTitle>
                  <AlertDescription className="text-sm overflow-y-auto max-h-40 break-all">{error}</AlertDescription>
                </Alert>
              )}
              {warningsAmount > 0 && (
                <Alert variant="warning">
                  <TriangleAlertIcon />
                  <AlertTitle>Important notice</AlertTitle>
                  <AlertDescription>
                    <p>
                      This operation includes {warningsAmount} alert
                      {warningsAmount > 1 ? 's' : ''}. Please review details below before continuing.
                    </p>
                    <ul className="list-inside list-disc text-sm">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <TransactionDecoderTabs
                renderSummary={renderSummary}
                decodedTransaction={decodedTransaction}
                isDarkMode={isDarkMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export type TransactionDecoderTabsProps<T> = {
  renderSummary?: (data: T) => React.ReactNode;
  decodedTransaction: T | null;
  isDarkMode: boolean;
};

export function TransactionDecoderTabs<T>({
  renderSummary,
  decodedTransaction,
  isDarkMode,
}: TransactionDecoderTabsProps<T>) {
  return (
    <div className="w-full">
      <Tabs className="w-full gap-6" defaultValue={renderSummary ? 'summary' : 'json'}>
        <TabsList className="w-full">
          {renderSummary && <TabsTrigger value="summary">Summary</TabsTrigger>}
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        {decodedTransaction ? (
          <>
            <TabsContent className="space-y-6 overflow-y-auto" value="summary">
              <div className="space-y-3">
                {decodedTransaction && renderSummary && renderSummary(decodedTransaction)}
              </div>
            </TabsContent>

            <TabsContent value="json" className="max-h-96 overflow-y-auto border-border border rounded-md p-2 relative">
              <div className="flex items-center sticky right-0 top-0 justify-end gap-2 z-10">
                <CopyButtonIcon
                  variant="outline"
                  size="icon"
                  textToCopy={JSON.stringify(convertBigIntToString(decodedTransaction ?? {}))}
                  disabled={!decodedTransaction}
                />
                <Button
                  disabled={!decodedTransaction}
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(convertBigIntToString(decodedTransaction ?? {}))], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transaction.json';
                    a.click();
                  }}
                >
                  <DownloadIcon />
                </Button>
              </div>
              <JsonView
                value={convertBigIntToString(decodedTransaction ?? {})}
                style={isDarkMode ? vscodeTheme : githubLightTheme}
              />
            </TabsContent>
          </>
        ) : (
          <TransactionDecoderEmptyState />
        )}
      </Tabs>
    </div>
  );
}
export function TransactionDecoderEmptyState() {
  return (
    <div className="border border-border rounded-md flex flex-col items-center justify-center text-muted-foreground h-40 gap-2">
      <InboxIcon />
      <p>Run a transaction to see the output here</p>
    </div>
  );
}
