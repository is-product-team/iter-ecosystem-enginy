import { describe, it, expect } from 'vitest';
import { 
  esEmailValido, 
  WorkshopSchema, 
  StudentSchema, 
  CenterAttendanceSchema 
} from './index.js';

describe('Shared Utilities', () => {
  it('should validate emails correctly', () => {
    expect(esEmailValido('test@example.com')).toBe(true);
    expect(esEmailValido('invalid-email')).toBe(false);
    expect(esEmailValido('test@domain')).toBe(false);
  });
});

describe('Zod Schemas', () => {
  describe('WorkshopSchema', () => {
    it('should validate a correct workshop', () => {
      const validWorkshop = {
        titol: 'Taller de Robòtica',
        durada_h: 10,
        places_maximes: 20,
        modalitat: 'A',
        id_sector: 1
      };
      expect(WorkshopSchema.safeParse(validWorkshop).success).toBe(true);
    });

    it('should fail on short title', () => {
      const invalidWorkshop = {
        titol: 'Ta',
        durada_h: 10,
        places_maximes: 20,
        modalitat: 'A',
        id_sector: 1
      };
      expect(WorkshopSchema.safeParse(invalidWorkshop).success).toBe(false);
    });

    it('should fail on invalid modality', () => {
      const invalidWorkshop = {
        titol: 'Taller de Robòtica',
        durada_h: 10,
        places_maximes: 20,
        modalitat: 'Z',
        id_sector: 1
      };
      expect(WorkshopSchema.safeParse(invalidWorkshop).success).toBe(false);
    });
  });

  describe('StudentSchema', () => {
    it('should validate a correct student', () => {
      const validStudent = {
        idalu: 'ALU123',
        nom: 'Joan',
        cognoms: 'Garcia'
      };
      expect(StudentSchema.safeParse(validStudent).success).toBe(true);
    });

    it('should fail on missing fields', () => {
      const invalidStudent = {
        idalu: 'ALU123'
      };
      expect(StudentSchema.safeParse(invalidStudent).success).toBe(false);
    });
  });

  describe('CenterAttendanceSchema', () => {
    it('should validate correct attendance states', () => {
      const validAttendance = {
        id_enrollment: 1,
        estat: 'Present'
      };
      expect(CenterAttendanceSchema.safeParse(validAttendance).success).toBe(true);
    });

    it('should fail on invalid state', () => {
      const invalidAttendance = {
        id_enrollment: 1,
        estat: 'Vacances'
      };
      expect(CenterAttendanceSchema.safeParse(invalidAttendance).success).toBe(false);
    });
  });
});
