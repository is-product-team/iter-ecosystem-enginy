import { Assignment, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class AssignmentRepository extends BaseRepository<Assignment, Prisma.AssignmentCreateInput, Prisma.AssignmentUpdateInput> {
  constructor() {
    super('assignment', 'id_assignment');
  }

  override async findById(id: number): Promise<Assignment | null> {
    return this.prisma.assignment.findUnique({
      where: { id_assignment: id },
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
      where: { id_center: centerId },
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
      where.id_center = centerId;
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        workshop: true,
        center: true,
        teachers: { include: { user: true } }
      },
      orderBy: { id_assignment: 'desc' }
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
