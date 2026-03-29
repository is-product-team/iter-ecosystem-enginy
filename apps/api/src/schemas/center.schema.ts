import { z } from 'zod';

export const createCenterSchema = z.object({
  body: z.object({
    centerCode: z.string().min(3, 'Center code is required'),
    name: z.string().min(3, 'Name is required'),
    address: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  }),
});

export const updateCenterSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric'),
  }),
  body: createCenterSchema.shape.body.partial(),
});
