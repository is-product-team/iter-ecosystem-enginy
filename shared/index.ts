import { z } from 'zod';
import { THEME } from './theme';

export { THEME };

// Exportar tipos de Prisma para que estén disponibles en todo el monorepo
// Nota: Requiere que la API haya ejecutado "npx prisma generate"
export type * from '@prisma/client';

// Define exact roles expected by the Database
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINADOR',
  TEACHER: 'PROFESSOR'
} as const;

export type RoleTag = typeof ROLES[keyof typeof ROLES];

// Define request statuses - Aligned with Prisma Enum 'RequestStatus'
export const REQUEST_STATUSES = {
  PENDING: 'Pendent',
  APPROVED: 'Aprovada',
  REJECTED: 'Rebutjada'
} as const;

export type RequestStatus = typeof REQUEST_STATUSES[keyof typeof REQUEST_STATUSES];
 
// Define assignment statuses - Aligned with Prisma Enum 'AssignmentStatus'
export const ASSIGNMENT_STATUSES = {
  PROVISIONAL: 'PROVISIONAL',
  PUBLISHED: 'PUBLISHED',
  DATA_ENTRY: 'DATA_ENTRY',
  DATA_SUBMITTED: 'DATA_SUBMITTED',
  VALIDATED: 'VALIDATED',
  READY_TO_START: 'READY_TO_START',
  VACANT: 'VACANT',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type AssignmentStatusTag = typeof ASSIGNMENT_STATUSES[keyof typeof ASSIGNMENT_STATUSES];

// Calendario Programa Iter (Curso 25-26 aprox)
export const CALENDARI = {
  REUNION_PRESENTACION: '2025-09-30',
  LIMITE_DEMANDA: '2025-10-10',
  COMUNICACION_ASIGNACIONES: '2025-10-20',
  GESTION_VACANTES: '2025-11-01',
} as const;

// Official phase names for consistency in DB and UI
export const PHASES = {
  APPLICATION: 'Sol·licitud i Inscripció',
  PLANNING: 'Planificació i Assignació',
  EXECUTION: 'Execució i Seguiment',
  CLOSURE: 'Tancament i Avaluació'
} as const;

export const PHASES_TIMELINE = [
  { id: 'PRESENTATION', name: PHASES.APPLICATION, data: CALENDARI.REUNION_PRESENTACION },
  { id: 'DEMAND', name: 'Enviament de Demanda', data: CALENDARI.LIMITE_DEMANDA },
  { id: 'ASSIGNMENT', name: PHASES.PLANNING, data: CALENDARI.COMUNICACION_ASIGNACIONES },
  { id: 'VACANTS', name: 'Gestió de Vacants i Incidències', data: CALENDARI.GESTION_VACANTES },
  { id: 'VALIDATION', name: PHASES.CLOSURE, data: null }
] as const;

// Utility functions
export const esEmailValido = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Zod Schemas for Validation
export const WorkshopSchema = z.object({
  titol: z.string().min(3).max(100),
  descripcio: z.string().optional(),
  durada_h: z.number().int().min(1).max(100),
  places_maximes: z.number().int().min(1).max(50),
  modalitat: z.enum(['A', 'B', 'C']),
  icona: z.string().optional(),
  id_sector: z.number().int(),
  dies_execucio: z.array(z.any()).optional()
});

export const StudentSchema = z.object({
  idalu: z.string().min(3),
  nom: z.string().min(1),
  cognoms: z.string().min(1),
  curs: z.string().optional(),
  id_center_origin: z.number().int().optional().nullable()
});

export const RequestSchema = z.object({
  id_center: z.number().int(),
  id_workshop: z.number().int(),
  alumnes_aprox: z.number().int().min(1).max(100),
  comentaris: z.string().optional()
});

export const AssignmentChecklistSchema = z.object({
  completat: z.boolean(),
  url_evidencia: z.string().optional().nullable()
});

export const CenterAttendanceSchema = z.object({
  id_enrollment: z.number().int(),
  estat: z.enum(['Present', 'Absència Justificada', 'Absència', 'Retard']),
  observacions: z.string().optional().nullable()
});

export type WorkshopInput = z.infer<typeof WorkshopSchema>;
export type StudentInput = z.infer<typeof StudentSchema>;
export type RequestInput = z.infer<typeof RequestSchema>;
export type AssignmentChecklistInput = z.infer<typeof AssignmentChecklistSchema>;
export type CenterAttendanceInput = z.infer<typeof CenterAttendanceSchema>;