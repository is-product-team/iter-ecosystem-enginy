import { Evaluation, Prisma, EvaluationType } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class EvaluationRepository extends BaseRepository<Evaluation, Prisma.EvaluationCreateInput, Prisma.EvaluationUpdateInput> {
  constructor() {
    super('evaluation', 'evaluationId');
  }

  override async findById(id: number): Promise<Evaluation | null> {
    return this.prisma.evaluation.findUnique({
      where: { evaluationId: id },
      include: {
        assignment: { include: { workshop: true, center: true } },
        enrollment: { include: { student: true } }
      }
    });
  }

  async findByAssignment(assignmentId: number, type?: EvaluationType): Promise<Evaluation[]> {
    return this.model.findMany({
      where: {
        assignmentId: assignmentId,
        type: type
      },
      include: { enrollment: { include: { student: true } } },
      orderBy: { sentAt: 'desc' }
    });
  }

  // Search by enrollment for self-consultations
  async findByEnrollment(enrollmentId: number): Promise<Evaluation[]> {
    return this.model.findMany({
      where: { enrollmentId: enrollmentId }
    });
  }
}

export const evaluationRepository = new EvaluationRepository();
