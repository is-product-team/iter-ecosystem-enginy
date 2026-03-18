import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.message} - ${req.method} ${req.url} - IP: ${req.ip}`);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors,
    });
  }

  // Errores conocidos de Prisma
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Error en la base de datos',
      message: err.message,
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
