import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge } from '@protocols/ui';
import { InstructionIcon } from '@/components/instructions/InstructionIcon';
import { InstructionSummary } from '@/components/instructions/InstructionSummary';
import { type DecodedInstruction, getProgramName } from '@/types';

export const Summary = ({ instructions }: { instructions: DecodedInstruction[] }) => {
  return (
    <>
      {instructions.map((instruction: DecodedInstruction, index: number) => (
        <Accordion
          key={index}
          type="single"
          collapsible
          defaultValue={`${instruction.type}-details`}
          className="bg-card text-card-foreground rounded-xl border"
        >
          <AccordionItem key={index} value={`${instruction.type}-details`} className="border-0">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
              <div className="flex items-center flex-wrap gap-2 text-muted-foreground text-sm">
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
                  {getProgramName(instruction.programId)}
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
