import { z } from 'zod';

export const createCentreSchema = z.object({
  body: z.object({
    centerCode: z.string().min(3, 'Codi de centre obligatori'),
    nom: z.string().min(3, 'Nom obligatori'),
    adreca: z.string().optional(),
    telefon_contacte: z.string().optional(),
    email_contacte: z.string().email('Email invàlid').optional().or(z.literal('')),
  }),
});

export const updateCentreSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID ha de ser numèric'),
  }),
  body: createCentreSchema.shape.body.partial(),
});
