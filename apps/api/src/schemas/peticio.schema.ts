import { z } from 'zod';

export const createPeticioSchema = z.object({
  body: z.object({
    id_workshop: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()),
    alumnes_aprox: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    comentaris: z.string().optional().nullable(),
    prof1_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    prof2_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
  }),
});

export const updatePeticioSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID ha de ser numèric'),
  }),
  body: z.object({
    alumnes_aprox: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    comentaris: z.string().optional().nullable(),
    prof1_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
    prof2_id: z.union([z.number(), z.string().transform((val) => parseInt(val))]).pipe(z.number().int().positive()).optional().nullable(),
  }),
});

export const updatePeticioStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID ha de ser numèric'),
  }),
  body: z.object({
    estat: z.enum(['Pendent', 'Aprovada', 'Rebutjada']),
  }),
});
