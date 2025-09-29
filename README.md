# minitelv2

## ⚠️  Disclaimer

* Kiln is a non-custodial staking provider. As the customer and ultimate owner of your assets, it is your sole responsibility to review, check, and verify all transactions before signing and broadcasting them.
* Kiln may provide certain tooling (such as web applications, APIs, or scripts) to facilitate interaction with supported protocols. These tools are provided for convenience only. They do not constitute advice, nor do they alter the fact that you remain solely responsible for the transactions you generate, sign, and broadcast.
* Kiln does not have access to your private keys and cannot execute, reverse, or validate transactions on your behalf. Kiln disclaims any responsibility or liability for the use of these scripts, including (without limitation) for missed staking rewards, slashing penalties, opportunity costs, or other losses (as defined in your agreement with Kiln).
* This repository and the associated code are provided “AS IS” and “AS AVAILABLE,” without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
* In no event shall Kiln, its affiliates, or its contributors be liable for any claim, damages, or other liability, whether in contract, tort, or otherwise, arising from, out of, or in connection with the use of this repository or the transactions you execute based on it.
* By using these tools, you acknowledge and agree that you are acting on your own responsibility and at your own risk.


A multi-chain transaction decoder monorepo built with Bun workspaces, Vite, React, Tailwind v4, and shadcn/ui. Decode and inspect raw transactions across different blockchain networks with a unified interface.

## Structure

```
├── apps/
│   ├── solana/          # Solana transaction decoder
│   └── ethereum/        # Ethereum transaction decoder
├── packages/
│   └── ui/              # Shared UI components and transaction decoder
└── package.json         # Root workspace config
```

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Run all decoders in development:

   ```bash
   bun run dev
   ```

3. Run specific chain decoder:

   ```bash
   cd apps/solana && bun run dev
   cd apps/ethereum && bun run dev
   ```

## Features

- **Multi-chain Support**: Decode transactions from Ethereum and Solana networks
- **Shared UI Package**: `@protocols/ui` with reusable components and decoder interface
- **Transaction Decoder**: Core `<TransactionDecoder />` component for reusable ui interface
- **Chain-specific Parsing**: Dedicated parsers for each supported blockchain
- **Rich Transaction Data**: View decoded instructions, addresses, and transaction details
- **Modern Stack**: Built with TypeScript, Tailwind v4, and shadcn/ui components

## Adding New Protocol Support

The project uses a standardized protocol adapter pattern that makes adding new chains simple and consistent.

### Quick Start (5-10 minutes)

1. **Create the app directory:**
   ```bash
   mkdir apps/your-protocol
   cd apps/your-protocol
   ```

2. **Copy base structure from existing protocol:**
   ```bash
   cp -r ../ethereum/* .
   # or
   cp -r ../solana/* .
   ```

3. **Create your protocol adapter:**
   ```typescript
   // apps/your-protocol/src/your-protocol-adapter.tsx
   import { type ProtocolAdapter } from '@protocols/shared';

   export const yourProtocolAdapter: ProtocolAdapter<YourTransactionType> = {
     name: 'your-protocol',
     displayName: 'Your Protocol',
     placeholder: 'Paste your transaction hex or JSON',

     parseTransaction: parseYourProtocolTx,
     computeHash: hashYourProtocolTx,
     renderSummary: (data) => <YourSummaryComponent transaction={data} />,
     generateWarnings: (data) => [
       // Return array of { message: string } warnings
     ],
   };
   ```

4. **Update your App.tsx:**
   ```typescript
   // apps/your-protocol/src/App.tsx
   import { ProtocolTransactionDecoder } from '@protocols/ui';
   import { yourProtocolAdapter } from './your-protocol-adapter';

   function App() {
     return (
       <div className="relative flex flex-col min-h-screen">
         <Background />
         <Header {...headerProps} />
         <ProtocolTransactionDecoder adapter={yourProtocolAdapter} />
       </div>
     );
   }
   ```

5. **Implement your parsing functions:**
   ```typescript
   // apps/your-protocol/src/parser.ts
   export const parseYourProtocolTx = async (rawTx: string): Promise<YourTransactionType> => {
     // Your parsing logic
   };

   export const hashYourProtocolTx = (rawTx: string): string => {
     // Your hashing logic
   };
   ```

### Protocol Adapter Type

The `ProtocolAdapter<T, W>` type provides a standardized contract:

```typescript
type ProtocolAdapter<TDecodedTransaction, TWarning = ProtocolWarning> = {
  // Basic info
  name: string;              // 'ethereum', 'solana', 'near'
  displayName: string;       // 'Ethereum', 'Solana', 'NEAR'

  // Required functions
  parseTransaction: (rawTx: string) => Promise<TDecodedTransaction>;
  computeHash: (rawTx: string) => string | Promise<string>;
  renderSummary: (data: TDecodedTransaction, hash?: string) => ReactNode;
  generateWarnings: (data: TDecodedTransaction) => TWarning[];

  // Optional UI customization
  placeholder?: string;
  title?: string;
  subtitle?: string;
}
```

### Examples

**Simple synchronous hash:**
```typescript
computeHash: (rawTx) => keccak256(rawTx)
```

**Async hash (like Solana):**
```typescript
computeHash: async (rawTx) => {
  const buffer = await crypto.subtle.digest('SHA-256', hexToUint8Array(rawTx));
  return bufferToHex(buffer);
}
```

**Complex warnings:**
```typescript
generateWarnings: (data) => {
  const warnings = [];
  if (data.value > parseEther('1')) {
    warnings.push({ message: `High value transaction: ${formatEther(data.value)} ETH` });
  }
  if (data.instructions?.some(ix => ix.warning)) {
    warnings.push(...data.instructions.filter(ix => ix.warning).map(ix => ({ message: ix.warning })));
  }
  return warnings;
}
```

### File Structure

Your protocol should follow this structure:
```
apps/your-protocol/
├── src/
│   ├── components/           # Protocol-specific UI components
│   │   └── YourSummary.tsx
│   ├── your-protocol-adapter.tsx  # Main adapter implementation
│   ├── parser.ts            # Transaction parsing logic
│   ├── App.tsx              # Main app component
│   └── types.ts             # Protocol-specific types
├── package.json
└── tsconfig.json
```

### Benefits of This Architecture

- **Consistent Interface**: All protocols use the same UI and interaction patterns
- **Type Safety**: Full TypeScript support with generics
- **Rapid Development**: New protocols can be added in minutes, not hours
- **Maintainable**: Shared UI logic reduces bugs and duplication
- **Extensible**: Easy to add protocol-specific features while maintaining consistency

## Adding Transaction Playbook

Add interactive example transactions for educational purposes. The playbook shows sample operations with step-by-step explanations.

### Quick Setup (2-3 minutes)

1. **Create playbook operations file:**
   ```typescript
   // apps/your-protocol/src/config/playbook-operations.ts
   import { type PlaybookOperation } from '@protocols/shared';

   export const YOUR_PROTOCOL_PLAYBOOK_OPERATIONS: PlaybookOperation[] = [
     {
       label: 'Transfer Tokens',
       value: 'transfer',
       description: 'Simple token transfer',
       rawTransaction: '0x...', // Your sample transaction
       operationOverview: [
         {
           type: 'text',
           content: 'This transaction transfers 10 tokens from Alice to Bob...',
         },
       ],
       stepByStep: [
         {
           title: 'Transfer',
           program: 'Token Program',
           description: 'Transfers 10 tokens from Alice to Bob',
         },
       ],
     },
     // Add more operations...
   ];
   ```

2. **Add playbook to your App.tsx:**
   ```typescript
   // apps/your-protocol/src/App.tsx
   import { TransactionPlaybook } from '@protocols/ui';
   import { YOUR_PROTOCOL_PLAYBOOK_OPERATIONS } from './config/playbook-operations';

   function App() {
     const [playbook, setPlaybook] = useState(false);
     const { decodedTransaction, decodeTransaction, hash } = useTransactionDecoder();

     const playbookConfig = {
       protocolName: 'Your Protocol',
       operations: YOUR_PROTOCOL_PLAYBOOK_OPERATIONS,
       renderSummary: (data) => <YourSummaryComponent transaction={data} />,
       decodeTransaction,
       decodedTransaction,
       hash,
     };

     return (
       <div className="flex">
         <div className={cn('w-full', playbook && 'md:mr-[40%]')}>
           <Header togglePlaybook={() => setPlaybook(!playbook)} />
           <ProtocolTransactionDecoder adapter={yourAdapter} />
         </div>
         <TransactionPlaybook
           config={playbookConfig}
           isOpen={playbook}
           onClose={() => setPlaybook(false)}
         />
       </div>
     );
   }
   ```

That's it! Your protocol now has an interactive playbook with sample transactions and educational content.
