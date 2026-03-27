import { PrismaClient } from '@prisma/client';

export class StudentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(studentId: number) {
    return this.prisma.student.findUnique({
      where: { studentId: studentId },
      include: { center_origin: true }
    });
  }

  async findByIdalu(idalu: string) {
    return this.prisma.student.findUnique({
      where: { idalu }
    });
  }

  async findByCenter(centerId: number) {
    return this.prisma.student.findMany({
      where: { originCenterId: centerId },
      include: { center_origin: true },
      orderBy: { lastName: 'asc' }
    });
  }
}
