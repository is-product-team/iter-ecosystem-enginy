import { Evaluation, Prisma, EvaluationType } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class EvaluationRepository extends BaseRepository<Evaluation, Prisma.EvaluationCreateInput, Prisma.EvaluationUpdateInput> {
  constructor() {
    super('evaluation', 'id_evaluation_teacher');
  }

  override async findById(id: number): Promise<Evaluation | null> {
    return this.prisma.evaluation.findUnique({
      where: { id_evaluation_teacher: id },
      include: {
        assignment: { include: { workshop: true, center: true } },
        enrollment: { include: { student: true } }
      }
    });
  }

  async findByAssignment(assignmentId: number, type?: EvaluationType): Promise<Evaluation[]> {
    return this.model.findMany({
      where: {
        id_assignment: assignmentId,
        tipus: type
      },
      include: { enrollment: { include: { student: true } } },
      orderBy: { data_enviament: 'desc' }
    });
  }

  // Búsqueda por alumno para autoconsultas
  async findByEnrollment(enrollmentId: number): Promise<Evaluation[]> {
    return this.model.findMany({
      where: { id_enrollment: enrollmentId }
    });
  }
}

export const evaluationRepository = new EvaluationRepository();
