import { z } from 'zod';
import { THEME } from './theme.js';

export { THEME };

// Definimos los roles exactos que espera la Base de Datos
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  PROFESOR: 'PROFESSOR'
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];

// Definimos los estados de las peticiones - Alineados con Prisma Enum 'EstatPeticio'
export const ESTADOS_PETICION = {
  PENDIENTE: 'Pendent',
  ACEPTADA: 'Aprovada',
  RECHAZADA: 'Rebutjada'
} as const;

export type EstadoPeticion = typeof ESTADOS_PETICION[keyof typeof ESTADOS_PETICION];

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
export const PeticioSchema = z.object({
  id_centre: z.number().int(),
  id_taller: z.number().int(),
  alumnes_aprox: z.number().int().min(1).max(100),
  comentaris: z.string().optional()
});

export const AssignmentChecklistSchema = z.object({
  id_checklist: z.number().int(),
  completat: z.boolean(),
  url_evidencia: z.string().url().optional().or(z.literal(''))
});

export const CentreAttendanceSchema = z.object({
  id_centre: z.number().int(),
  asistencia_reunion: z.boolean()
});

export type PeticioInput = z.infer<typeof PeticioSchema>;
export type AssignmentChecklistInput = z.infer<typeof AssignmentChecklistSchema>;
export type CentreAttendanceInput = z.infer<typeof CentreAttendanceSchema>;