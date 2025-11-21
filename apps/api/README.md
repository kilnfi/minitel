# Minitel Transaction Decoder API

A REST API for decoding blockchain transactions across 21 different protocols.

## Overview

This API provides endpoints to decode raw blockchain transactions into human-readable formats. It supports Ethereum, Solana, NEAR, Cosmos ecosystem chains, Substrate chains (Polkadot/Kusama), and more.

## Installation

```bash
# From the apps/api directory
bun install
```

## Development

```bash
# Start the API server
bun run dev

# API will be available at http://localhost:4000
```

## Production

```bash
# Build
bun run build

# Start
bun start
```

## API Endpoints

### `GET /api/health`

Health check endpoint that returns the API status and list of supported protocols.

**Response:**
```json
{
  "status": "ok",
  "protocols": ["ethereum", "solana", "near", ...],
  "version": "1.0.0"
}
```

### `POST /api/decode`

Decode a raw blockchain transaction.

**Request:**
```json
{
  "protocol": "ethereum",
  "rawTx": "0x02f8..."
}
```

**Response:**
```json
{
  "protocol": "Ethereum",
  "decodedTransaction": {
    "to": "0x...",
    "from": "0x...",
    "value": "1000000000000000000",
    "data": "0x...",
    ...
  },
  "hash": "0xabc123...",
  "warnings": [
    {
      "message": "High value transaction: 1.0 ETH"
    }
  ]
}
```

## Supported Protocols

### EVM Chains
- `ethereum` - Ethereum mainnet and compatible chains

### Layer 1s
- `solana` - Solana
- `near` - NEAR Protocol
- `ada` - Cardano
- `sui` - Sui
- `ton` - TON (Telegram Open Network)
- `trx` - Tron
- `xtz` - Tezos

### Cosmos Ecosystem
- `atom` - Cosmos Hub
- `dydx` - dYdX
- `injective` - Injective
- `kava` - Kava
- `mantra` - Mantra
- `osmosis` - Osmosis
- `sei` - Sei
- `tia` - Celestia
- `zeta` - ZetaChain
- `cronos` - Cronos
- `fetch` - Fetch.ai

### Substrate Ecosystem
- `dot` - Polkadot
- `ksm` - Kusama

## Examples

### Decode Ethereum Transaction

```bash
curl -X POST http://localhost:4000/api/decode \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "ethereum",
    "rawTx": "0x02f8..."
  }'
```

### Decode Solana Transaction

```bash
curl -X POST http://localhost:4000/api/decode \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "solana",
    "rawTx": "01000000..."
  }'
```

### Health Check

```bash
curl http://localhost:4000/api/health
```

## Architecture

The API is structured as follows:

```
src/
├── adapters/          # Protocol adapter registry
├── parsers/           # Protocol-specific parsing logic
│   ├── ethereum.ts
│   ├── solana.ts
│   ├── cosmos.ts
│   ├── substrate.ts
│   └── ...
├── routes/            # Express routes
├── types/             # TypeScript types
├── utils/             # Utility functions
└── server.ts          # Express server setup
```

### Key Features

- **Protocol Adapter Pattern**: Unified interface for all blockchain protocols
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error messages and status codes
- **No State**: Stateless API design (Substrate connections close after each request)
- **CORS Enabled**: Ready for frontend integration

## Browser-Specific Code Fixes

The API parsers have been adapted from the frontend codebase with the following fixes:

1. **TON**: Replaced `atob()` with `Buffer.from(data, 'base64')`
2. **Cardano**: Using `@emurgo/cardano-serialization-lib-nodejs` instead of browser version
3. **Tron**: Using protobufjs directly instead of relying on `globalThis.proto`
4. **Substrate**: Implements connection-per-request pattern (connects and disconnects for each parse)

## Error Responses

All errors return JSON with the following format:

```json
{
  "error": "ApiError",
  "message": "Error description",
  "protocol": "ethereum"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (invalid protocol, missing fields)
- `500` - Internal server error (parsing failure)

## Performance Notes

- **Most protocols**: < 100ms response time
- **Substrate (Polkadot/Kusama)**: 2-3 seconds (WebSocket connection overhead per request)
- **Recommended**: Cache decoded transactions by hash for repeated requests

## Deployment

### Vercel/Railway/Similar

```bash
# Build command
bun run build

# Start command
bun start

# Environment variables
PORT=4000  # Optional, defaults to 4000
```

### Docker

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 4000
CMD ["bun", "start"]
```

## Contributing

When adding a new protocol:

1. Create parser in `src/parsers/{protocol}.ts`
2. Add adapter in `src/adapters/index.ts`
3. Add protocol to `SupportedProtocol` type in `src/types/api.ts`
4. Update this README

## License

Same as the main Minitel project.
