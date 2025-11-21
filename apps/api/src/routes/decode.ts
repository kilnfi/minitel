import { Router, type Request, type Response } from 'express';
import { getAdapter, getSupportedProtocols } from '@/adapters';
import type { DecodeRequest, DecodeResponse, ErrorResponse, HealthResponse, SupportedProtocol } from '@/types/api';
import { ApiError } from '@/utils/error-handler';

const router = Router();

// POST /api/decode - Decode a transaction
router.post(
  '/decode',
  async (req: Request<object, DecodeResponse | ErrorResponse, DecodeRequest>, res: Response<DecodeResponse | ErrorResponse>) => {
    try {
      const { protocol, rawTx } = req.body;

      // Validation
      if (!protocol) {
        throw new ApiError(400, 'Missing required field: protocol');
      }
      if (!rawTx) {
        throw new ApiError(400, 'Missing required field: rawTx');
      }

      // Check if protocol is supported
      const supportedProtocols = getSupportedProtocols();
      if (!supportedProtocols.includes(protocol as SupportedProtocol)) {
        throw new ApiError(400, `Unsupported protocol: ${protocol}. Supported protocols: ${supportedProtocols.join(', ')}`, protocol);
      }

      // Get adapter for protocol
      const adapter = getAdapter(protocol as SupportedProtocol);

      // Parse transaction
      const decodedTransaction = await adapter.parseTransaction(rawTx);

      // Compute hash
      const hash = await adapter.computeHash(rawTx);

      // Generate warnings
      const warnings = adapter.generateWarnings ? adapter.generateWarnings(decodedTransaction) : undefined;

      // Convert BigInt values to strings for JSON serialization
      const serializableTransaction = JSON.parse(
        JSON.stringify(decodedTransaction, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );

      // Return response
      res.json({
        protocol: adapter.displayName,
        decodedTransaction: serializableTransaction,
        hash,
        warnings,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to decode transaction');
    }
  },
);

// GET /api/health - Health check
router.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    protocols: getSupportedProtocols(),
    version: '1.0.0',
  });
});

export default router;
