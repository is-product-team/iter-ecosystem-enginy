import { Request as PrismaRequest, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class RequestRepository extends BaseRepository<PrismaRequest, Prisma.RequestCreateInput, Prisma.RequestUpdateInput> {
  constructor() {
    super('request', 'requestId');
  }

  override async findById(id: number): Promise<any> {
    return this.prisma.request.findUnique({
      where: { requestId: id },
      include: {
        center: true,
        workshop: true
      }
    });
  }

  async findByCenter(centerId: number): Promise<PrismaRequest[]> {
    return this.model.findMany({
      where: { centerId: centerId },
      include: { workshop: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllDetailed(role: string, centerId?: number): Promise<PrismaRequest[]> {
    const where: Prisma.RequestWhereInput = {};
    if (role !== 'ADMIN' && centerId) {
      where.centerId = centerId;
    }

    return this.model.findMany({
      where,
      include: {
        center: true,
        workshop: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const requestRepository = new RequestRepository();
