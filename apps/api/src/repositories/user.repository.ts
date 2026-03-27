import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  constructor() {
    // Definimos el modelo y su clave primaria
    super('user', 'userId');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, center: true }
    });
  }

  async findWithDetails(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId: id },
      include: { role: true, center: true }
    });
  }
}

export const userRepository = new UserRepository();
