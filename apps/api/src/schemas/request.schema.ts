import { z } from 'zod';
import { REQUEST_STATUSES } from '@iter/shared';

export const createRequestSchema = z.object({
  body: z.object({
    workshopId: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()),
    studentsAprox: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    comments: z.string().optional().nullable(),
    prof1_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    prof2_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
  }),
});

export const updateRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric'),
  }),
  body: z.object({
    studentsAprox: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    comments: z.string().optional().nullable(),
    prof1_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    prof2_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
  }),
});

export const updateRequestStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric'),
  }),
  body: z.object({
    status: z.enum([REQUEST_STATUSES.PENDING, REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.REJECTED]),
  }),
});
