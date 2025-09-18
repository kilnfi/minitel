import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { CopyIcon, DownloadIcon, InboxIcon, InfoIcon, TriangleAlertIcon, ZapIcon } from 'lucide-react';
import { useId, useRef } from 'react';
import { CopyButtonIcon } from '#/components/copy-button';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardFooter } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { Textarea } from '#/components/ui/textarea';
import { useIsDarkMode } from '#/hooks/useIsDarkMode';
import { cn } from '#/lib/utils';
import { Badge } from '#/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/ui/tooltip';

export interface TransactionDecoderProps<T = unknown> {
  title?: string;
  subtitle?: string;
  rawTransaction: string;
  onRawTransactionChange: (value: string) => void;
  onDecode: () => void;
  decodedTransaction: T | null;
  hash?: string;
  sampleTransaction?: string;
  warnings?: Array<{ message: string }>;
  renderSummary?: (data: T) => React.ReactNode;
  placeholder?: string;
  error?: string;
}

export function TransactionDecoder<T = unknown>({
  title = 'Transaction decoder',
  rawTransaction,
  onRawTransactionChange,
  onDecode,
  decodedTransaction,
  hash,
  sampleTransaction,
  warnings = [],
  renderSummary,
  placeholder = 'Paste your transaction as hex or JSON',
  error,
}: TransactionDecoderProps<T>) {
  const textareaId = useId();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const warningsAmount = warnings.length;
  const isDarkMode = useIsDarkMode();

  return (
    <div className="relative flex flex-col gap-4 items-center justify-center px-4 w-full">
      <div className="flex flex-col items-center gap-y-8 py-8 min-h-screen w-full">
        <div className="gap-4 text-foreground flex flex-col items-center justify-center">
          <h1 className="text-4xl font-extrabold">{title}</h1>
        </div>
        <div className="flex flex-col gap-4 max-w-5xl w-full mx-auto">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">Paste your raw transaction</span>
                <div className="flex items-center gap-2">
                  {sampleTransaction && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onRawTransactionChange(sampleTransaction);
                        setTimeout(() => {
                          textAreaRef.current?.focus();
                          textAreaRef.current?.select();
                        }, 0);
                      }}
                    >
                      Try Sample
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
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
              <div className="grid w-full gap-3">
                {/* <Label htmlFor="transaction">Raw transaction</Label> */}
                <Textarea
                  className="h-20 overflow-auto resize-y"
                  placeholder={placeholder}
                  id={textareaId}
                  value={rawTransaction}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onRawTransactionChange(e.target.value)}
                  ref={textAreaRef}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button disabled={!rawTransaction} size="lg" onClick={onDecode}>
                <ZapIcon /> Run
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center w-full justify-between">
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
    </div>
  );
}

export type TransactionDecoderTabsProps<T = unknown> = {
  renderSummary?: (data: T) => React.ReactNode;
  decodedTransaction: T | null;
  isDarkMode: boolean;
};

export function TransactionDecoderTabs<T = unknown>({
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
            {renderSummary && (
              <TabsContent className="space-y-6 overflow-y-auto" value="summary">
                <div className="space-y-3">{decodedTransaction && renderSummary(decodedTransaction)}</div>
              </TabsContent>
            )}
            <TabsContent value="json" className="max-h-96 overflow-y-auto border-border border rounded-md p-2">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={!decodedTransaction}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(decodedTransaction));
                  }}
                >
                  <CopyIcon />
                </Button>
                <Button
                  disabled={!decodedTransaction}
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(decodedTransaction)], {
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
              <JsonView value={decodedTransaction ?? {}} style={isDarkMode ? vscodeTheme : githubLightTheme} />
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
