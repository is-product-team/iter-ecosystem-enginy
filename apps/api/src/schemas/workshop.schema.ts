import { z } from 'zod';

export const createWorkshopSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    durationHours: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().positive()),
    maxPlaces: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().positive()),
    modality: z.enum(['A', 'B', 'C']),
    sectorId: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()),
    executionDays: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string()
    })).or(z.array(z.string())).optional(),
  }),
});

export const updateWorkshopSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric'),
  }),
  body: createWorkshopSchema.shape.body.partial(),
});
