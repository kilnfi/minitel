import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { DownloadIcon, InfoIcon, TriangleAlertIcon, ZapIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { CopyButton, CopyButtonIcon } from '#/components/copy-button';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardFooter } from '#/components/ui/card';
import { Label } from '#/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { Textarea } from '#/components/ui/textarea';
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
  subtitle = 'Decode and analyze blockchain transactions',
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
  const warningsAmount = warnings.length;
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="relative flex flex-col gap-4 items-center justify-center px-4 w-full">
      <div className="flex flex-col items-center gap-y-14 py-14 min-h-screen w-full">
        <div className="gap-4 text-foreground flex flex-col items-center justify-center">
          <h1 className="text-5xl font-extrabold">{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="flex flex-col gap-4 max-w-5xl w-full mx-auto">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">Paste your transaction</span>
                {sampleTransaction && (
                  <Button variant="outline" onClick={() => onRawTransactionChange(sampleTransaction)}>
                    <InfoIcon />
                  </Button>
                )}
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="transaction">Raw transaction</Label>
                <Textarea
                  className="h-48 resize-y"
                  placeholder={placeholder}
                  id={textareaId}
                  value={rawTransaction}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onRawTransactionChange(e.target.value)}
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
              <span className="text-xl font-semibold">Output</span>
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
                  <AlertTitle>Important notice.</AlertTitle>
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
              <div className="flex items-center justify-between gap-2 w-full max-w-full overflow-hidden">
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
                  <span className="text-xs truncate">{hash ? hash : 'No transaction hash yet'}</span>
                  <CopyButtonIcon textToCopy={hash ?? ''} disabled={!hash} />
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton size="lg" disabled={!decodedTransaction} textToCopy={JSON.stringify(decodedTransaction)}>
                    Copy JSON
                  </CopyButton>
                  <Button
                    disabled={!decodedTransaction}
                    size="lg"
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
                    Download
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <Tabs className="w-full gap-6" defaultValue={renderSummary ? 'summary' : 'json'}>
                  <TabsList className="w-full">
                    {renderSummary && <TabsTrigger value="summary">Summary</TabsTrigger>}
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  {renderSummary && (
                    <TabsContent className="space-y-6" value="summary">
                      <div className="space-y-3">{decodedTransaction && renderSummary(decodedTransaction)}</div>
                    </TabsContent>
                  )}
                  <TabsContent value="json">
                    <JsonView value={decodedTransaction ?? {}} style={isDarkMode ? vscodeTheme : githubLightTheme} />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
