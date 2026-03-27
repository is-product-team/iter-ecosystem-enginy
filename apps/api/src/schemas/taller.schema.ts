import { z } from 'zod';

export const createTallerSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
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

export const updateTallerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID debe ser numérico'),
  }),
  body: createTallerSchema.shape.body.partial(),
});
