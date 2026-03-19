import { z } from 'zod';
import { THEME } from './theme.js';

export { THEME };

// Exportar tipos de Prisma para que estén disponibles en todo el monorepo
// Nota: Requiere que la API haya ejecutado "npx prisma generate"
export type * from '@prisma/client';

// Definimos los roles exactos que espera la Base de Datos
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  PROFESSOR: 'PROFESSOR'
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];

// Definimos los estados de las peticiones - Alineados con Prisma Enum 'EstatRequest'
export const REQUEST_STATUSES = {
  PENDIENTE: 'Pending',
  ACEPTADA: 'Approved',
  RECHAZADA: 'Rejected'
} as const;

export type EstadoRequestn = typeof REQUEST_STATUSES[keyof typeof REQUEST_STATUSES];

// Calendario Programa Iter (Curso 25-26 aprox)
export const CALENDARI = {
  REUNION_PRESENTACION: '2025-09-30',
  LIMITE_DEMANDA: '2025-10-10',
  COMUNICACION_ASIGNACIONES: '2025-10-20',
  GESTION_VACANTES: '2025-11-01',
} as const;

// Nombres oficiales de las fases para consistencia en DB y UI
export const PHASES = {
  SOLICITUD: 'Sol·licitud i Inscripció',
  PLANIFICACION: 'Planificació i Assignació',
  EJECUCION: 'Execució i Seguiment',
  CIERRE: 'Tancament i Avaluació'
} as const;

export const FASES_TIMELINE = [
  { id: 'PRESENTACIO', nom: PHASES.SOLICITUD, data: CALENDARI.REUNION_PRESENTACION },
  { id: 'DEMANDA', nom: 'Enviament de Demanda', data: CALENDARI.LIMITE_DEMANDA },
  { id: 'ASSIGNACIO', nom: PHASES.PLANIFICACION, data: CALENDARI.COMUNICACION_ASIGNACIONES },
  { id: 'VACANTS', nom: 'Gestió de Vacants i Incidències', data: CALENDARI.GESTION_VACANTES },
  { id: 'VALIDACIO', nom: PHASES.CIERRE, data: null }
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