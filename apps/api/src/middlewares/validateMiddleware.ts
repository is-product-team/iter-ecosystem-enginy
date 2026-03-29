import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateData = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // The error will be captured by the Global Error Handler
      return next(error);
    }
  };
};
