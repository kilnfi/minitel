import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
import { CodeIcon, FileIcon, HashIcon, InfoIcon, ListChecksIcon, ListIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsDarkMode } from '#/hooks/useIsDarkMode';
import { cn } from '#/lib/utils';
import { Summary } from '@/components/Summary';
import { useTransactionDecoder } from '@/hooks/useTransactionDecoder';

type Operation = {
  label: string;
  value: string;
  description: string;
  rawTransaction: string;
  operationOverview: React.ReactNode;
  stepByStep: React.ReactNode;
};

const OPERATIONS: Operation[] = [
  {
    label: 'Create a stake',
    value: 'create-stake',
    description: 'Create a stake',
    rawTransaction: `0300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063b2b5ef76d483b695bc3b954d9a372ca5f744e00279c8578bc4268d570b701a037fac575ae16bb3ba5702b8d5bd9930953453e2d628368f83a11ab5896d20bbcae0b4a119860afd99da20f3462ba15d8bd1528d73724b83e8cc4cee00787df28a181783c264113ef1870bae5a90987fc5cfcdffaddf23c7dcfd7585c13d10b0301080c373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e1bb5f70b4d3ae65feb6d20587f62ccc8d5e720e99abe3d4415972bbf74a8a88a51f5f3871e65b84cc393458d0f23a413184cf2bb7093ae4e2c99d55b39a575c5f98e3135fcb53e71e6fafcb4da3a3cc36af1c76a1a7e72aa12eae1346d724c6c00000000000000000000000000000000000000000000000000000000000000004792650d1e9a4fe99721617c7d47c8712c14c20a76bf043368c6528c9090531a06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a1d817a502050b680791e6ce6db88e1e5b7150f61fc6790a4eb4d10000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000f0973e76495f3ffc65798a529de5cba4ec7f47f17669c9fa256923f099a1cda304040303090204040000000402000134000000000080c6a47e8d0300c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc0000000000602010a7400000000373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006060105080b07000402000000`,
    operationOverview: (
      <div className="space-y-2">
        <p className="text-muted-foreground">This transaction uses a durable nonce, then:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>
            Creates a new stake account <span className="font-mono">(2sAw…qdPX)</span> funded with{' '}
            <span className="font-semibold">1,000,000 SOL</span> (1e15 lamports)
          </li>
          <li>
            Initializes it (staker & withdrawer = <span className="font-mono">4ics…zvA9</span>, no lockup)
          </li>
          <li>
            Delegates it to validator vote account <span className="font-mono">5pPR…HzSm</span>
          </li>
        </ol>
      </div>
    ),
    stepByStep: (
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">1. System program — AdvanceNonceAccount</p>
          <p className="">
            Consumes the current nonce (the value shown in recentBlockhash) and advances the nonce account to a new,
            unique nonce.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">2. System program — Create</p>
          <p className="">
            Allocates and funds the stake account. (The new account must sign, which is why 2sAw…qdPX is in the
            signatures array.)
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">3. Stake program — Initialize</p>
          <p className="">
            Turns the allocated account into a valid stake account with 4ics…zvA9 as both staker & withdrawer. No lockup
            restrictions.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">4. Stake program — Delegate</p>
          <p className="">Delegates the stake to the validator’s vote account 5pPR...HzSm.</p>
        </div>
      </div>
    ),
  },
  {
    label: 'Split a stake',
    value: 'split-stake',
    description: 'Split a stake',
    rawTransaction: `02000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000205813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b88f1ffa3a2dfe617bdc4e3573251a322e3fcae81e5a457390e64751c00a465e2372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037ceb000000000000000000000000000000000000000000000000000000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc000000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b7160203020001340000000080d5220000000000c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000004030201000c0300000040420f0000000000`,
    operationOverview: (
      <div className="space-y-2">
        <p className="text-muted-foreground">This transaction is composed of two instructions that:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>
            Create a new stake account ADaU…S49 (funded with rent-exempt reserve, owned by the Stake program), then
          </li>
          <li>Splits 1,000,000 lamports (0.001 SOL) from source stake 4iKA…nZG into that new account.</li>
          <li>
            Both stakes end up with the same authorities/lockup and (if the source was delegated) the same
            delegation/state.
          </li>
        </ol>
      </div>
    ),
    stepByStep: (
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">1. System Program — Create</p>
          <p className="">
            Allocates and funds a new account owned by the stake program. This creates an uninitialized stake account
            shell that is rent-exempt, ready to receive stake via split.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">2. Stake Program — Split</p>
          <p className="">
            Moves 1,000,000 lamports of stake from the source into the new destination stake account. The destination
            inherits the source’s staker/withdrawer authorities and lockup; if the source was delegated/active, the
            destination gets the same delegation and state as of the split.
          </p>
        </div>
      </div>
    ),
  },
  {
    label: 'Withdraw a stake',
    value: 'withdraw-stake',
    description: 'Withdraw a stake',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000306813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8bd5bc428a6dceea70c3d243e29e0660dbfdb4fadd85c5f7d210afdcedef7ccc75813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b71601030501000004050c04000000ad19230000000000`,
    operationOverview: (
      <div className="space-y-2">
        <p className="text-muted-foreground">
          This transaction withdraws 2,300,333 lamports (≈ 0.002300333 SOL) from stake account FPLL…UwyN to the fee
          payer 9hSJ…fNz.
        </p>
      </div>
    ),
    stepByStep: (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">1. Stake Program — Withdraw</p>
        <p className="">
          Moves 2,300,333 lamports from the stake account into the recipient system account 9hSJ…fNz, authorized by the
          withdraw authority.
        </p>
      </div>
    ),
  },
  {
    label: 'Deactivate a stake',
    value: 'deactivate-stake',
    description: 'Deactivate a stake',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000204813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037ceb06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b2100000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b7160102030103000405000000`,
    operationOverview: (
      <div className="space-y-2">
        <p className="text-muted-foreground">This transaction deactivates the stake account 4iKA…nZG.</p>
      </div>
    ),
    stepByStep: (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">1. Stake program — Deactivate</p>
        <p className="">Signals the network to undelegate this stake.</p>
      </div>
    ),
  },
  {
    label: 'Merge stakes',
    value: 'merge-stakes',
    description: 'Merge stakes',
    rawTransaction: `010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000306813957546062ab61afbd54af1f479f88594eff8aa350542f768967632821bf8b372869b8f0211d21ce9a5e7ca5b9a0a93d1eab5caef186a0365a86ed13037cebd5bc428a6dceea70c3d243e29e0660dbfdb4fadd85c5f7d210afdcedef7ccc7506a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000e15eca55fb618985657f116c78d7f626321a9a6579707b7c1313bdc29854b71601030501020004050407000000`,
    operationOverview: (
      <div className="space-y-2">
        <p className="text-muted-foreground">This transaction merges stake account FPLL…UwyN into 4iKA…nZG.</p>
      </div>
    ),
    stepByStep: (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">1. Stake Program — Merge</p>
        <p className="">
          Combine the source’s stake into the destination. After a successful merge, the destination carries the total
          lamports; the source is emptied and deallocated.
        </p>
      </div>
    ),
  },
];

export const SolanaPlaybook = ({ playground }: { playground: boolean }) => {
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
        'fixed right-0 top-0 bottom-0 border-l bg-secondary transition-all duration-300 ease-in-out overflow-auto',
        playground ? 'w-[40%]' : 'w-0',
      )}
    >
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">Solana decode playbook</h2>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoIcon className="size-4" />
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
                <SelectTrigger>
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
                  <FileIcon className="size-4" />
                  Raw transaction
                </div>
                <p className="text-muted-foreground text-sm break-all max-h-48 h-auto overflow-y-auto">
                  {selectedOperationData?.rawTransaction}
                </p>
              </div>

              <div className="p-3 border rounded-md space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs font-semibold">
                  <HashIcon className="size-4" />
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
                <AccordionContent>{selectedOperationData?.operationOverview}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-by-step">
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <ListChecksIcon className="size-4" />
                    Step-by-step operation
                  </div>
                </AccordionTrigger>
                <AccordionContent>{selectedOperationData?.stepByStep}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
