import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Function to log errors for monitoring
const logError = (errorData: {
  error: Error;
  endpoint: string;
  timestamp: string;
  user?: string;
}) => {
  // In a production environment, this would send to a logging service
  console.error('[ERROR LOG]', JSON.stringify(errorData, null, 2));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  // Log error for monitoring
  logError({
    error: err,
    endpoint: `${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    user: (req as any).auth?.userId || 'anonymous'
  });
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        details: err.errors
      }
    });
  }
  
  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'API_ERROR',
        message: err.message
      }
    });
  }
  
  // Handle all other errors
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error',
      requestId: (req as any).id
    }
  });
}; 