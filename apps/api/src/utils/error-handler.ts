import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public protocol?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      protocol: err.protocol,
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
};
