import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';
import { sendError } from '../lib/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`[API Error] ${err.message} - ${req.method} ${req.url} - IP: ${req.ip}`);

  // Errores de Zod (Validación)
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation failed', 400, err.errors);
  }

  // Errores conocidos de Prisma
  if (err.code?.startsWith('P')) {
    return sendError(res, 'Database error', 400, { code: err.code, message: err.message });
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  return sendError(
    res, 
    message, 
    statusCode, 
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};
