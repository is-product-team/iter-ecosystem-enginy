import { Center, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class CenterRepository extends BaseRepository<Center, Prisma.CenterCreateInput, Prisma.CenterUpdateInput> {
  constructor() {
    super('center', 'id_center');
  }

  // Sobrescribimos findById para usar id_center
  override async findById(id: number): Promise<Center | null> {
    return this.prisma.center.findUnique({
      where: { id_center: id },
      include: {
        users: { select: { id_user: true, nom_complet: true, email: true, role: true } },
        assignments: { include: { workshop: true } }
      }
    });
  }

  async findByCode(code: string): Promise<Center | null> {
    return this.model.findUnique({
      where: { codi_center: code }
    });
  }
}

export const centerRepository = new CenterRepository();
