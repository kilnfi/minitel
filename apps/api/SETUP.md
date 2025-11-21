# API Setup Instructions

## Prerequisites

This API requires Bun to be installed. If you don't have Bun:

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# Or on macOS via Homebrew
brew install bun
```

## Installation

From the project root:

```bash
# Install dependencies for the entire monorepo (including the API)
bun install
```

Or just for the API:

```bash
cd apps/api
bun install
```

## Development

```bash
# From apps/api directory
bun run dev

# Or from project root
cd apps/api && bun run dev
```

The API will start on `http://localhost:4000`

## Testing the API

Once running, test with:

```bash
# Health check
curl http://localhost:4000/api/health

# Decode a sample transaction (you'll need actual transaction data)
curl -X POST http://localhost:4000/api/decode \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "ethereum",
    "rawTx": "YOUR_TRANSACTION_HEX"
  }'
```

## Next Steps

1. **Install Bun** (see above)
2. **Install dependencies**: `bun install` from project root
3. **Start the API**: `cd apps/api && bun run dev`
4. **Test endpoints**: Use curl or Postman to test `/api/health` and `/api/decode`

## Troubleshooting

### Missing Dependencies

If you see errors about missing packages:
```bash
cd apps/api
bun install
```

### TypeScript Errors

If you see import path errors:
```bash
# Make sure you're using the TypeScript paths configured in tsconfig.json
# The API uses @/* path aliases
```

### Parser Errors

Some parsers (especially TRX) may need additional setup:
- **Tron (TRX)**: Requires the `trx-protos.ts` file to be properly configured
- **Substrate (DOT/KSM)**: Requires network access to WebSocket RPC endpoints
- **Cardano (ADA)**: Uses the Node.js version of cardano-serialization-lib

## Architecture Notes

The API is structured to be completely independent of the frontend code:

- **No React dependencies**: All parsers are pure TypeScript functions
- **Node.js compatible**: Browser-specific code has been replaced
- **Stateless**: Each request is independent (Substrate opens/closes connections)
- **Type-safe**: Full TypeScript coverage with proper types

See the main README.md for full API documentation.
