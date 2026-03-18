import { Response } from 'express';

/**
 * Estructura estándar para respuestas exitosas de la API.
 */
export const sendSuccess = (res: Response, data: any, message?: string, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    data,
  });
};

/**
 * Estructura estándar para respuestas de error de la API.
 */
export const sendError = (res: Response, error: string, statusCode: number = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: error || 'An unexpected error occurred',
    details: details || null,
  });
};
