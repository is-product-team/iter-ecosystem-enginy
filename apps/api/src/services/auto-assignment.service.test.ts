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

  it('should return a message if no requests found', async () => {
    prismaMock.request.findMany.mockResolvedValue([]);
    
    const result = await service.generateAssignments();
    
    expect(result).toEqual({ message: 'No se encontraron solicitudes para procesar.' });
    expect(prismaMock.request.findMany).toHaveBeenCalled();
  });

  describe('Fair Distribution Logic', () => {
    it('should split capacity evenly among centers (Fair Share)', async () => {
      // Mock Workshop with capacity 10
      prismaMock.workshop.findUnique.mockResolvedValue({
        workshopId: 1,
        title: 'Workshop Test',
        maxPlaces: 10,
        executionDays: []
      } as any);

      // Mock 2 Requests (Center A demands 8, Center B demands 6) -> Total 14 > 10
      const mockRequests = [
        {
          requestId: 101,
          centerId: 1,
          workshopId: 1,
          createdAt: new Date('2024-03-01T10:00:00Z'),
          studentsAprox: 8
        },
        {
          requestId: 102,
          centerId: 2,
          workshopId: 1,
          createdAt: new Date('2024-03-01T11:00:00Z'),
          studentsAprox: 6
        }
      ];

      prismaMock.request.findMany.mockResolvedValue(mockRequests as any);
      prismaMock.assignment.findMany.mockResolvedValue([]); // No current assignments
      prismaMock.enrollment.count.mockResolvedValue(0); 
      prismaMock.assignment.create.mockResolvedValue({ assignmentId: 1 } as any);

      const result = await service.generateAssignments();

      // Fair Share: 10 / 2 = 5 each. 
      expect(result.processed).toBe(2);
      expect(prismaMock.assignment.create).toHaveBeenCalledTimes(2);
    });

    it('should assign remainders by priority (Earliest Timestamp)', async () => {
      // Mock Workshop with capacity 5
      prismaMock.workshop.findUnique.mockResolvedValue({
        workshopId: 1,
        title: 'Workshop Test',
        maxPlaces: 5,
        executionDays: []
      } as any);

      // 2 Centers (A and B) both demand 3 students. Total 6 > 5.
      // Base Share = floor(5/2) = 2. 
      // Leftover = 5 - (2*2) = 1.
      // Center A is earlier -> Gets 2 + 1 = 3. 
      // Center B gets 2.
      const mockRequests = [
        {
          requestId: 101,
          centerId: 1,
          workshopId: 1,
          createdAt: new Date('2024-03-01T09:00:00Z'), // Earlier
          studentsAprox: 3
        },
        {
          requestId: 102,
          centerId: 2,
          workshopId: 1,
          createdAt: new Date('2024-03-01T10:00:00Z'),
          studentsAprox: 3
        }
      ];

      prismaMock.request.findMany.mockResolvedValue(mockRequests as any);
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.enrollment.count.mockResolvedValue(0);
      prismaMock.assignment.create.mockResolvedValue({ assignmentId: 1 } as any);

      await service.generateAssignments();

      expect(prismaMock.assignment.create).toHaveBeenCalledTimes(2);
    });
  });
});
