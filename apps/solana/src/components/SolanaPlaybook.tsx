import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TransactionDecoderTabs,
} from '@protocols/ui';
import {
  CodeIcon,
  InfoIcon,
  KeyRoundIcon,
  ListChecksIcon,
  ListIcon,
  ListIndentDecreaseIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useIsDarkMode } from '#/hooks/useIsDarkMode';
import { cn } from '#/lib/utils';
import { Summary } from '@/components/Summary';
import { useTransactionDecoder } from '@/hooks/useTransactionDecoder';

type OperationOverviewItem = {
  type: 'text';
  content: string;
};

type StepByStepItem = {
  title: string;
  program: string;
  description: string;
};

type Operation = {
  label: string;
  value: string;
  description: string;
  rawTransaction: string;
  operationOverview: OperationOverviewItem[];
  stepByStep: StepByStepItem[];
};

const OPERATIONS: Operation[] = [
  {
    label: 'Create a stake',
    value: 'create-stake',
    description: 'Create a stake',
    rawTransaction: `0300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063b2b5ef76d483b695bc3b954d9a372ca5f744e00279c8578bc4268d570b701a037fac575ae16bb3ba5702b8d5bd9930953453e2d628368f83a11ab5896d20bbcae0b4a119860afd99da20f3462ba15d8bd1528d73724b83e8cc4cee00787df28a181783c264113ef1870bae5a90987fc5cfcdffaddf23c7dcfd7585c13d10b0301080c373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e1bb5f70b4d3ae65feb6d20587f62ccc8d5e720e99abe3d4415972bbf74a8a88a51f5f3871e65b84cc393458d0f23a413184cf2bb7093ae4e2c99d55b39a575c5f98e3135fcb53e71e6fafcb4da3a3cc36af1c76a1a7e72aa12eae1346d724c6c00000000000000000000000000000000000000000000000000000000000000004792650d1e9a4fe99721617c7d47c8712c14c20a76bf043368c6528c9090531a06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a1d817a502050b680791e6ce6db88e1e5b7150f61fc6790a4eb4d10000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000f0973e76495f3ffc65798a529de5cba4ec7f47f17669c9fa256923f099a1cda304040303090204040000000402000134000000000080c6a47e8d0300c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc0000000000602010a7400000000373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006060105080b07000402000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction uses a durable nonce, then: Creates a new stake account (2sAw…qdPX) funded with 1,000,000 SOL (1e15 lamports) Initializes it (staker & withdrawer = 4ics…zvA9, no lockup) Delegates it to validator vote account 5pPR…HzSm',
      },
    ],
    stepByStep: [
      {
        title: 'AdvanceNonceAccount',
        program: 'System program',
        description:
          'Consumes the current nonce (the value shown in recentBlockhash) and advances the nonce account to a new, unique nonce.',
      },
      {
        title: 'Create',
        program: 'System program',
        description:
          'Allocates and funds the stake account. (The new account must sign, which is why 2sAw…qdPX is in the signatures array.)',
      },
      {
        title: 'Initialize',
        program: 'Stake program',
        description:
          'Turns the allocated account into a valid stake account with 4ics…zvA9 as both staker & withdrawer. No lockup restrictions.',
      },
      {
        title: 'Delegate',
        program: 'Stake program',
        description: "Delegates the stake to the validator's vote account 5pPR...HzSm.",
      },
    ],
  },
  {
    label: 'Split a stake',
    value: 'split-stake',
    description: 'Split a stake',
    rawTransaction: `02000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000205813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b88f1ffa3a2dfe617bdc4e3573251a322e3fcae81e5a457390e64751c00a465e2372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037ceb000000000000000000000000000000000000000000000000000000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc000000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b7160203020001340000000080d5220000000000c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000004030201000c0300000040420f0000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction is composed of two instructions that: Create a new stake account ADaU…S49 (funded with rent-exempt reserve, owned by the Stake program), then Splits 1,000,000 lamports (0.001 SOL) from source stake 4iKA…nZG into that new account. Both stakes end up with the same authorities/lockup and (if the source was delegated) the same delegation/state.',
      },
    ],
    stepByStep: [
      {
        title: 'Create',
        program: 'System program',
        description:
          'Allocates and funds a new account owned by the stake program. This creates an uninitialized stake account shell that is rent-exempt, ready to receive stake via split.',
      },
      {
        title: 'Split',
        program: 'Stake program',
        description:
          "Moves 1,000,000 lamports of stake from the source into the new destination stake account. The destination inherits the source's staker/withdrawer authorities and lockup; if the source was delegated/active, the destination gets the same delegation and state as of the split.",
      },
    ],
  },
  {
    label: 'Withdraw a stake',
    value: 'withdraw-stake',
    description: 'Withdraw a stake',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000306813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8bd5bc428a6dceea70c3d243e29e0660dbfdb4fadd85c5f7d210afdcedef7ccc75813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b71601030501000004050c04000000ad19230000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction withdraws 2,300,333 lamports (≈ 0.002300333 SOL) from stake account FPLL…UwyN to the fee payer 9hSJ…fNz.',
      },
    ],
    stepByStep: [
      {
        title: 'Withdraw',
        program: 'Stake program',
        description:
          'Moves 2,300,333 lamports from the stake account into the recipient system account 9hSJ…fNz, authorized by the withdraw authority.',
      },
    ],
  },
  {
    label: 'Deactivate a stake',
    value: 'deactivate-stake',
    description: 'Deactivate a stake',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000204813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037ceb06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b2100000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b7160102030103000405000000`,
    operationOverview: [
      {
        type: 'text',
        content: 'This transaction deactivates the stake account 4iKA…nZG.',
      },
    ],
    stepByStep: [
      {
        title: 'Deactivate',
        program: 'Stake program',
        description: 'Signals the network to undelegate this stake.',
      },
    ],
  },
  {
    label: 'Merge stakes',
    value: 'merge-stakes',
    description: 'Merge stakes',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000306813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037cebd5bc428a6dceea70c3d243e29e0660dbfdb4fadd85c5f7d210afdcedef7ccc7506a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b71601030501020004050407000000`,
    operationOverview: [
      {
        type: 'text',
        content: 'This transaction merges stake account FPLL…UwyN into 4iKA…nZG.',
      },
    ],
    stepByStep: [
      {
        title: 'Merge',
        program: 'Stake program',
        description:
          "Combine the source's stake into the destination. After a successful merge, the destination carries the total lamports; the source is emptied and deallocated.",
      },
    ],
  },
  {
    label: '⚠️ Malicious stake authority change',
    value: 'malicious-stake-authority',
    description: 'Malicious stake authority change example',
    rawTransaction: `0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a23a6609a1fb1c53713baa3126c49d67bc0e25c1abe8fe117e9308e220f4807ce6f5b3ece93801a9cb70754021aadde065b485b406d38de2da52cf10919df90402010310367c028c53021ed2a144b3e0d46dd06216a989dec748a24b3fefbecec65628f051f5f3871e65b84cc393458d0f23a413184cf2bb7093ae4e2c99d55b39a575c545a2d07a42915e1ac8ea972643827eb8fef8c121d74a555afa1e31506abce33646e1a1bb9419fdb9e9cfb6f43bd2ee131a47e08965b356941b17946dfc068f3f5649b1ea61af5a48b4c4cc3bffd8507587c7bda7204275f06e19c9b3f13719155ae4b64986d565b08719e6395ec5781ae297fbfbe3dd4dc192ea6007a6ce46816b6ce5ff737271e8a765a2c395e6db84301d7a6f6db9d11f0577fc78b3f45fa981f3e54c80d7f57c30e8b5a2f8af29add5fff2b5ccefec0de69db730ac8897b28acd6b78eea3aa40dd9b23706be03f64c65a2da13d86ac49a2b3154aa83c3d6e9da44be35733abbb4b4e2c4c623a439970b13197b793f87186b0b58d695f3a5dba3a6283a4e688218964d2d3aad7f3bed9c190ab0d268c2e4a20192240a0a7baecb32973b9d627f80dfbe9f84f9284c037d7b7869e1dbe56e9c3b97bbffb5f3806a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b2100000000000000000000000000000000000000000000000000000000000000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea9400000ecb1dbeda3c9b33b1aa2ed8a8392544b28cd5a5a985c507b59eb794c6492ec360a0d03040f0104040000000e03020c0004050000000e030a0c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03070c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e030b0c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03050c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03080c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03030c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03090c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c010000000e03060c00280100000006cc6f84306e580d107e04f0b24ff68df16ed7c31a9d379b1cc325998dae0f9c01000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          '⚠️ WARNING: This malicious transaction attempts to modify stake account authorities for 8 different stake accounts. It includes an advance nonce operation followed by a deactivation and 8 separate authorize instructions that change the withdrawer authority to a potentially malicious address.',
      },
    ],
    stepByStep: [
      {
        title: 'AdvanceNonceAccount',
        program: 'System Program',
        description: 'Advance nonce account 6oqE...cp by authority 6WwY...68',
      },
      {
        title: 'Deactivate',
        program: 'Stake Program',
        description: 'Deactivate stake account 5gq8...ZX by authority 4fgh...x7',
      },
      {
        title: 'Authorize (1/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account DXxU...XX',
      },
      {
        title: 'Authorize (2/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account 9kHJ...CV',
      },
      {
        title: 'Authorize (3/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account Gvyf...D5',
      },
      {
        title: 'Authorize (4/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account 77oy...SY',
      },
      {
        title: 'Authorize (5/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account ALpw...cZ',
      },
      {
        title: 'Authorize (6/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account 5mh6...34',
      },
      {
        title: 'Authorize (7/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account BcNK...Gx',
      },
      {
        title: 'Authorize (8/8)',
        program: 'Stake Program',
        description: 'Set Withdrawer authority from 4fgh...x7 to TYFW...K1 on stake account 8ELw...Ki',
      },
    ],
  },
];

const renderOperationOverview = (items: OperationOverviewItem[]) => {
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

const renderStepByStep = (steps: StepByStepItem[]) => {
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

export const SolanaPlaybook = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const isDarkMode = useIsDarkMode();
  const [selectedOperation, setSelectedOperation] = useState<string>(OPERATIONS[0].value);
  const { decodedTransaction, decodeTransaction, hash } = useTransactionDecoder();

  const selectedOperationData = OPERATIONS.find((operation) => operation.value === selectedOperation);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <can ignore safely>
  useEffect(() => {
    decodeTransaction(OPERATIONS[0].rawTransaction);
  }, []);

  return (
    <div
      className={cn(
        'fixed right-0 top-0 bottom-0 border-l bg-secondary transition-all duration-300 ease-in-out overflow-auto z-50',
        isOpen ? 'w-full md:w-[40%]' : 'w-0',
      )}
    >
      <div className="px-4 py-7 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Solana decode playbook</h2>
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
                These are sample transactions for learning. They’re not your transaction. Use the section on the left to
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
                  decodeTransaction(OPERATIONS.find((operation) => operation.value === value)?.rawTransaction || '');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an operation" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATIONS.map((operation) => (
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Playbook output breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="decoded-data">
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <CodeIcon className="size-4" />
                    Decoded transaction data
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <TransactionDecoderTabs
                    renderSummary={() =>
                      decodedTransaction ? <Summary instructions={decodedTransaction.instructions} /> : null
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
                  {selectedOperationData?.operationOverview &&
                    renderOperationOverview(selectedOperationData.operationOverview)}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-by-step">
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <ListChecksIcon className="size-4" />
                    Step-by-step operation
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {selectedOperationData?.stepByStep && renderStepByStep(selectedOperationData.stepByStep)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
