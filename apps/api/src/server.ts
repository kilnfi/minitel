import express from 'express';
import cors from 'cors';
import decodeRouter from './routes/decode';
import { errorHandler } from './utils/error-handler';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', decodeRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Minitel Transaction Decoder API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      decode: 'POST /api/decode',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minitel API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/decode`);
});

export default app;
