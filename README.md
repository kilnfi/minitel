# Protocols Monorepo

A simple monorepo for protocol information websites using Bun workspaces, Vite, React, Tailwind v4, and shadcn/ui.

## Structure

```
├── apps/
│   ├── solana/          # Solana protocol app
│   └── ethereum/        # Ethereum protocol app
├── packages/
│   └── ui/              # Shared UI components
└── package.json         # Root workspace config
```

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run all apps in development:
   ```bash
   bun run dev
   ```

3. Run specific app:
   ```bash
   cd apps/solana && bun run dev
   cd apps/ethereum && bun run dev
   ```

## Features

- **Shared UI Package**: `@protocols/ui` with shadcn components
- **Protocol Info Component**: Reusable `<ProtocolInfo protocol={data} />` 
- **Path Aliases**: Simple `@protocols/ui` imports
- **Tailwind v4**: Latest styling with CSS custom properties
- **TypeScript**: Full type safety across packages

## Adding New Protocols

1. Create new app in `apps/` directory
2. Copy structure from existing apps
3. Import and use `<ProtocolInfo />` component
4. Define your protocol data with the `Protocol` type