import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge } from '@protocols/ui';
import { InstructionIcon } from '@/components/instructions/InstructionIcon';
import { InstructionSummary } from '@/components/instructions/InstructionSummary';
import type { DecodedInstruction } from '@/types';
import { STAKE_PROGRAM_ID, SYSTEM_PROGRAM_ID } from '@/utils';

export const Summary = ({ instructions }: { instructions: DecodedInstruction[] }) => {
  return (
    <>
      {instructions.map((instruction: DecodedInstruction, index: number) => (
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
};
