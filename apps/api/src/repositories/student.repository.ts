import { Student, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class StudentRepository extends BaseRepository<Student, Prisma.StudentCreateInput, Prisma.StudentUpdateInput> {
  constructor() {
    super('student', 'id_student');
  }

  // Sobrescribimos findById para usar id_student
  override async findById(id: number): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { id_student: id },
      include: { center_origin: true }
    });
  }

  async findByIdalu(idalu: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { idalu }
    });
  }

  async findByCenter(centerId: number): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { id_center_origin: centerId },
      include: { center_origin: true },
      orderBy: { surnames: 'asc' }
    });
  }
}

export const studentRepository = new StudentRepository();
