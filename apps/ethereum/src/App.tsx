/** biome-ignore-all lint/suspicious/noArrayIndexKey: <safe to use> */
import {
  Button,
  Card,
  CardContent,
  CopyButton,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@protocols/ui';
import JsonView from '@uiw/react-json-view';
import { CopyIcon, DownloadIcon, ZapIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { parseEthTx } from '@/parser';

function App() {
  const [rawTransaction, setRawTransaction] = useState('');
  const [decodedTransaction, setDecodedTransaction] = useState<object | null>(null);
  const [hash, setHash] = useState('');

  const handleDecode = async () => {
    const decoded_tx = parseEthTx(rawTransaction);
    const transactionUint8Array = new Uint8Array(
      rawTransaction.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );

    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
    setDecodedTransaction(decoded_tx);
  };

  return (
    <div className="flex flex-col items-center gap-y-14 py-14 min-h-screen">
      <div className="gap-4 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold">Ethereum Raw transaction decoder</h1>
        <p>Decode and analyze blockchain transactions</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-3xl">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">Paste your transaction</span>
              <Button variant="outline" onClick={() => setRawTransaction('')}>
                Try sample
              </Button>
            </div>
            <div className="grid w-full gap-3">
              <Label htmlFor="transaction">Raw transaction</Label>
              <Textarea
                className="h-48 resize-y"
                placeholder={'Paste your transaction as hex or Fireblocks message JSON'}
                id={useId()}
                value={rawTransaction}
                onChange={(e) => setRawTransaction(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <span className="text-xl font-semibold">Run decoder</span>
            <Button className="w-full" size="sm" onClick={() => handleDecode()}>
              <ZapIcon /> Run
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <span className="text-xl font-semibold">Hash</span>
            {hash ? (
              <pre className="relative bg-secondary rounded-md px-4 py-3.5 font-mono text-sm overflow-x-auto">
                <code>{hash}</code>
                <Button
                  className="size-5 absolute right-4 top-1/2 -translate-y-1/2"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(hash)}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Decode a transaction to get the hash</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <span className="text-xl font-semibold">Output</span>
            <div className="w-full">
              <Tabs className="w-full gap-6" defaultValue="summary">
                <TabsList className="w-full">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent className="space-y-6" value="summary">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Decoded transaction data</span>
                    <div className="flex items-center gap-2">
                      <CopyButton disabled={!decodedTransaction} textToCopy={JSON.stringify(decodedTransaction)}>
                        Copy
                      </CopyButton>
                      <Button
                        disabled={!decodedTransaction}
                        size="sm"
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
                        Downlaod
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="json">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Decoded transaction data</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled={!decodedTransaction}>
                        <CopyIcon />
                        Copy JSON
                      </Button>
                      <Button size="sm" variant="outline" disabled={!decodedTransaction}>
                        <DownloadIcon />
                        Downlaod
                      </Button>
                    </div>
                  </div>
                  <JsonView value={decodedTransaction as object} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
