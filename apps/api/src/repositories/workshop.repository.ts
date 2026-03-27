import { Workshop, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class WorkshopRepository extends BaseRepository<Workshop, Prisma.WorkshopCreateInput, Prisma.WorkshopUpdateInput> {
  constructor() {
    super('workshop', 'workshopId');
  }

  // Sobrescribimos findById para usar workshopId
  override async findById(id: number): Promise<Workshop | null> {
    return this.prisma.workshop.findUnique({
      where: { workshopId: id },
      include: { sector: true }
    });
  }

  async findAllWithSectors(): Promise<Workshop[]> {
    return this.model.findMany({
      include: { sector: true },
      orderBy: { titol: 'asc' }
    });
  }

  async findBySector(sectorId: number): Promise<Workshop[]> {
    return this.model.findMany({
      where: { sectorId: sectorId },
      include: { sector: true }
    });
  }
}

export const workshopRepository = new WorkshopRepository();
