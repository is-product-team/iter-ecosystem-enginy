import { Center, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class CenterRepository extends BaseRepository<Center, Prisma.CenterCreateInput, Prisma.CenterUpdateInput> {
  constructor() {
    super('center', 'centerId');
  }

  // Sobrescribimos findById para usar centerId
  override async findById(id: number): Promise<Center | null> {
    return this.prisma.center.findUnique({
      where: { centerId: id },
      include: {
        users: { select: { userId: true, fullName: true, email: true, role: true } },
        assignments: { include: { workshop: true } }
      }
    });
  }

  async findByCode(code: string): Promise<Center | null> {
    return this.model.findUnique({
      where: { centerCode: code }
    });
  }
}

export const centerRepository = new CenterRepository();
