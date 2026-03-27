import { Request as Peticio, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class RequestRepository extends BaseRepository<Request, Prisma.RequestCreateInput, Prisma.RequestUpdateInput> {
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

  async findByCenter(centerId: number): Promise<Peticio[]> {
    return this.model.findMany({
      where: { centerId: centerId },
      include: { workshop: true },
      orderBy: { data_request: 'desc' }
    });
  }

  async findAllDetailed(role: string, centerId?: number): Promise<Peticio[]> {
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
      orderBy: { data_request: 'desc' }
    });
  }
}

export const requestRepository = new RequestRepository();
