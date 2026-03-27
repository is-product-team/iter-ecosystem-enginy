import { Student, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class StudentRepository extends BaseRepository<Student, Prisma.StudentCreateInput, Prisma.StudentUpdateInput> {
  constructor() {
    super('student', 'studentId');
  }

  override async findById(id: number): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { studentId: id },
      include: { centerOrigin: true }
    });
  }

  async findByIdalu(idalu: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { idalu }
    });
  }

  async findByCenter(centerId: number): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { originCenterId: centerId },
      include: { centerOrigin: true },
      orderBy: { lastName: 'asc' }
    });
  }
}

export const studentRepository = new StudentRepository();
