import { Workshop, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class WorkshopRepository extends BaseRepository<Workshop, Prisma.WorkshopCreateInput, Prisma.WorkshopUpdateInput> {
  constructor() {
    super('workshop', 'workshopId');
  }

  // Override findById to use workshopId
  override async findById(id: number): Promise<Workshop | null> {
    return this.prisma.workshop.findUnique({
      where: { workshopId: id },
      include: { sector: true }
    });
  }

  async findAllWithSectors(): Promise<Workshop[]> {
    return (this.prisma.workshop as any).findMany({
      include: { sector: true },
      orderBy: { title: 'asc' }
    });
  }

  async findBySector(sectorId: number): Promise<Workshop[]> {
    return (this.prisma.workshop as any).findMany({
      where: { sectorId: sectorId },
      include: { sector: true }
    });
  }
}

export const workshopRepository = new WorkshopRepository();
