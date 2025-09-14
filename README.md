# minitelv2

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

## Adding New Chain Support

1. Create new app in `apps/` directory
2. Copy structure from existing chain decoders
3. Implement chain-specific transaction parser
4. Use shared `<TransactionDecoder />` component
5. Add chain-specific components for instruction display
