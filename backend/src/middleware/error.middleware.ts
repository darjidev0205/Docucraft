import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isOriginAllowed } from '../config/cors';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  // Ensure CORS headers are attached on error responses if not already sent
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin) && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds allowed limit (10MB max).' });
  }

  const statusCode = err.statusCode || (err.name === 'UnauthorizedError' ? 401 : 500);
  const message =
    err.isOperational || (err.message && statusCode < 500)
      ? err.message
      : 'An internal server error occurred.';

  res.status(statusCode).json({
    error: message,
  });
}
