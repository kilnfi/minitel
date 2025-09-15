/** biome-ignore-all lint/suspicious/noArrayIndexKey: <safe to use> */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, TransactionDecoder } from '@protocols/ui';
import { useState } from 'react';
import { InstructionIcon } from '@/components/instructions/InstructionIcon';
import { InstructionSummary } from '@/components/instructions/InstructionSummary';
import { useUrlParam } from '@/hooks/useUrlParam';
import { type ParseSolTxResult, parseSolTx } from '@/parser';
import type { DecodedInstruction } from '@/types';
import { STAKE_PROGRAM_ID, SYSTEM_PROGRAM_ID, sampleTransaction } from '@/utils';

function App() {
  const [rawTransaction, setRawTransaction] = useUrlParam({
    paramName: 'tx',
    defaultValue: '',
  });
  const [decodedTransaction, setDecodedTransaction] = useState<ParseSolTxResult | null>(null);
  const [hash, setHash] = useState('');

  const handleDecode = async () => {
    const decoded_tx = parseSolTx(rawTransaction);
    const transactionUint8Array = new Uint8Array(
      rawTransaction.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );

    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
    setDecodedTransaction(decoded_tx);
  };

  const instructions = decodedTransaction?.instructions || [];
  const warnings = instructions
    .filter((instruction: DecodedInstruction) => instruction.warning)
    .map((instruction: DecodedInstruction) => ({
      message: instruction.warning?.replace('⚠️ ', '') || '',
    }));

  const renderSummary = (data: ParseSolTxResult) => (
    <>
      {data.instructions.map((instruction: DecodedInstruction, index: number) => (
        <Accordion
          key={index}
          type="single"
          collapsible
          defaultValue="unstake-details"
          className="bg-card text-card-foreground rounded-xl border"
        >
          <AccordionItem key={index} value="unstake-details" className="border-0">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="p-1 rounded-md bg-secondary">
                  <InstructionIcon
                    type={instruction.type}
                    hasWarning={Boolean(instruction.warning)}
                    hasError={Boolean(instruction.error)}
                  />
                </div>
                <span>Instruction</span>
                <Badge className="font-semibold" variant="secondary">
                  {instruction.type}
                </Badge>
                <span>on</span>
                <Badge className="font-semibold" variant="secondary">
                  {instruction.programId === SYSTEM_PROGRAM_ID.toString()
                    ? 'System Program'
                    : instruction.programId === STAKE_PROGRAM_ID.toString()
                      ? 'Stake Program'
                      : instruction.type === 'unknown'
                        ? 'unknown'
                        : instruction.type === 'error'
                          ? 'error'
                          : `${instruction.programId.slice(0, 8)}...`}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <span className="text-xs font-medium inline-flex items-center flex-wrap">
                <InstructionSummary instruction={instruction} index={index} />
              </span>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );

  return (
    <TransactionDecoder
      title="Raw transaction decoder"
      subtitle="Decode and analyze blockchain transactions"
      rawTransaction={rawTransaction}
      onRawTransactionChange={setRawTransaction}
      onDecode={handleDecode}
      decodedTransaction={decodedTransaction}
      hash={hash}
      sampleTransaction={sampleTransaction}
      warnings={warnings}
      renderSummary={renderSummary}
      placeholder="Paste your transaction as hex or Fireblocks message JSON"
    />
  );
}

export default App;
