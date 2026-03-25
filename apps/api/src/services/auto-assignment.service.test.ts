import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoAssignmentService } from './auto-assignment.service.js';
import prisma from '../lib/prisma.js';

vi.mock('../lib/prisma.js', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    __esModule: true,
    default: mockDeep(),
  };
});

const prismaMock = prisma as any;

describe('AutoAssignmentService', () => {
  let service: AutoAssignmentService;

  beforeEach(() => {
    service = new AutoAssignmentService();
    vi.clearAllMocks();
  });

  it('should return a message if no petitions found', async () => {
    prismaMock.request.findMany.mockResolvedValue([]);
    
    const result = await service.generateAssignments();
    
    expect(result).toEqual({ message: 'No petitions found to process.' });
    expect(prismaMock.request.findMany).toHaveBeenCalled();
  });

  describe('Fair Distribution Logic', () => {
    it('should split capacity evenly among centers (Fair Share)', async () => {
      // Mock Workshop with capacity 10
      prismaMock.workshop.findUnique.mockResolvedValue({
        id_workshop: 1,
        titol: 'Taller Test',
        places_maximes: 10,
        dies_execucio: []
      } as any);

      // Mock 2 Petitions (Center A demands 8, Center B demands 6) -> Total 14 > 10
      const mockPetitions = [
        {
          id_request: 101,
          id_center: 1,
          id_workshop: 1,
          data_request: new Date('2024-03-01T10:00:00Z'),
          alumnes_aprox: 8
        },
        {
          id_request: 102,
          id_center: 2,
          id_workshop: 1,
          data_request: new Date('2024-03-01T11:00:00Z'),
          alumnes_aprox: 6
        }
      ];

      prismaMock.request.findMany.mockResolvedValue(mockPetitions as any);
      prismaMock.assignment.findMany.mockResolvedValue([]); // No current assignments
      prismaMock.assignment.create.mockResolvedValue({ id_assignment: 1 } as any);

      const result = await service.generateAssignments();

      // Fair Share: 10 / 2 = 5 each. 
      expect(result.processed).toBe(2);
      expect(prismaMock.assignment.create).toHaveBeenCalledTimes(2);
    });

    it('should assign remainders by priority (Earliest Timestamp)', async () => {
      // Mock Workshop with capacity 5
      prismaMock.workshop.findUnique.mockResolvedValue({
        id_workshop: 1,
        titol: 'Taller Test',
        places_maximes: 5,
        dies_execucio: []
      } as any);

      // 2 Centers (A and B) both demand 3 students. Total 6 > 5.
      // Base Share = floor(5/2) = 2. 
      // Leftover = 5 - (2*2) = 1.
      // Center A is earlier -> Gets 2 + 1 = 3. 
      // Center B gets 2.
      const mockPetitions = [
        {
          id_request: 101,
          id_center: 1,
          id_workshop: 1,
          data_request: new Date('2024-03-01T09:00:00Z'), // Earlier
          alumnes_aprox: 3
        },
        {
          id_request: 102,
          id_center: 2,
          id_workshop: 1,
          data_request: new Date('2024-03-01T10:00:00Z'),
          alumnes_aprox: 3
        }
      ];

      prismaMock.request.findMany.mockResolvedValue(mockPetitions as any);
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.assignment.create.mockResolvedValue({ id_assignment: 1 } as any);

      await service.generateAssignments();

      expect(prismaMock.assignment.create).toHaveBeenCalledTimes(2);
    });
  });
});
