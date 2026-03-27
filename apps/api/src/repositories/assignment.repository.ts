import { Assignment, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class AssignmentRepository extends BaseRepository<Assignment, Prisma.AssignmentCreateInput, Prisma.AssignmentUpdateInput> {
  constructor() {
    super('assignment', 'assignmentId');
  }

  override async findById(id: number): Promise<Assignment | null> {
    return this.prisma.assignment.findUnique({
      where: { assignmentId: id },
      include: {
        workshop: true,
        center: true,
        checklist: true,
        enrollments: { include: { student: true } },
        teachers: { include: { user: true } },
        sessions: { include: { staff: { include: { user: true } } } }
      }
    });
  }

  async findByCenter(centerId: number): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: { centerId: centerId },
      include: {
        workshop: true,
        center: true,
        teachers: { include: { user: true } }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  async findAllDetailed(role: string, centerId?: number): Promise<Assignment[]> {
    const where: Prisma.AssignmentWhereInput = {};
    if (role !== 'ADMIN' && centerId) {
      where.centerId = centerId;
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        workshop: true,
        center: true,
        teachers: { include: { user: true } }
      },
      orderBy: { assignmentId: 'desc' }
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
