import { z } from 'zod';
import { THEME } from './theme';

export { THEME };

// Export Prisma types to be available in the whole monorepo
// Note: Requires API to run "npx prisma generate"
export type * from '@prisma/client';

// Define exact roles expected by the Database
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
} as const;

export type RoleTag = typeof ROLES[keyof typeof ROLES];

// Define request statuses - Aligned with Prisma Enum 'RequestStatus'
export const REQUEST_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
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

// Iter Program Calendar (Approx Course 25-26)
export const CALENDAR = {
  PRESENTATION_MEETING: '2025-09-30',
  DEMAND_LIMIT: '2025-10-10',
  ASSIGNMENT_COMMUNICATION: '2025-10-20',
  VACANCY_MANAGEMENT: '2025-11-01',
} as const;

// Official phase names for consistency in DB and UI
export const PHASES = {
  APPLICATION: 'Application',
  PLANNING: 'Planning',
  EXECUTION: 'Execution',
  CLOSURE: 'Closure'
} as const;

// Standardized checklist steps for Phase 2
export const CHECKLIST_STEPS = {
  DESIGNATE_TEACHERS: 'DESIGNATE_TEACHERS',
  INPUT_STUDENTS: 'INPUT_STUDENTS',
  NOMINAL_REGISTRATION: 'NOMINAL_REGISTRATION',
  CONFIRM_REGISTRATION: 'CONFIRM_REGISTRATION',
  PEDAGOGICAL_AGREEMENT: 'PEDAGOGICAL_AGREEMENT'
} as const;

export const PHASES_TIMELINE = [
  { id: 'PRESENTATION', name: PHASES.APPLICATION, date: CALENDAR.PRESENTATION_MEETING },
  { id: 'DEMAND', name: 'Demand Submission', date: CALENDAR.DEMAND_LIMIT },
  { id: 'ASSIGNMENT', name: PHASES.PLANNING, date: CALENDAR.ASSIGNMENT_COMMUNICATION },
  { id: 'VACANTS', name: 'Vacancy & Issue Management', date: CALENDAR.VACANCY_MANAGEMENT },
  { id: 'VALIDATION', name: PHASES.CLOSURE, date: null }
] as const;

// Utility functions
export const isEmailValid = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Zod Schemas for Validation
export const WorkshopSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  durationHours: z.number().int().min(1).max(100),
  maxPlaces: z.number().int().min(1).max(50),
  modality: z.enum(['A', 'B', 'C']),
  icon: z.string().optional(),
  sectorId: z.number().int(),
  executionDays: z.array(z.any()).optional()
});

export const StudentSchema = z.object({
  idalu: z.string().min(3),
  fullName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.string().optional(),
  originCenterId: z.number().int().optional().nullable()
});

export const RequestSchema = z.object({
  centerId: z.number().int(),
  workshopId: z.number().int(),
  studentsAprox: z.number().int().min(1).max(100),
  comments: z.string().optional()
});

export const AssignmentChecklistSchema = z.object({
  isCompleted: z.boolean(),
  evidenceUrl: z.string().optional().nullable()
});

export const CenterAttendanceSchema = z.object({
  enrollmentId: z.number().int(),
  status: z.enum(['PRESENT', 'JUSTIFIED_ABSENCE', 'ABSENT', 'LATE']),
  observations: z.string().optional().nullable()
});

export type WorkshopInput = z.infer<typeof WorkshopSchema>;
export type StudentInput = z.infer<typeof StudentSchema>;
export type RequestInput = z.infer<typeof RequestSchema>;
export type AssignmentChecklistInput = z.infer<typeof AssignmentChecklistSchema>;
export type CenterAttendanceInput = z.infer<typeof CenterAttendanceSchema>;
