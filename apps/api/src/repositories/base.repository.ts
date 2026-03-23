import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma.js';

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected model: any;
  protected primaryKey: string;

  constructor(modelName: keyof PrismaClient, primaryKey: string) {
    this.prisma = prisma;
    this.model = (this.prisma as any)[modelName];
    this.primaryKey = primaryKey;
  }

  async findById(id: number): Promise<T | null> {
    return this.model.findUnique({
      where: { [this.primaryKey]: id }
    });
  }

  async findAll(params?: { 
    where?: any; 
    orderBy?: any; 
    skip?: number; 
    take?: number;
    include?: any;
  }): Promise<T[]> {
    return this.model.findMany(params);
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { [this.primaryKey]: id },
      data,
    });
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({
      where: { [this.primaryKey]: id },
    });
  }
}
