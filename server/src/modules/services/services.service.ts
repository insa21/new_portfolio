import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreateServiceInput, UpdateServiceInput } from './services.schema.js';

export class ServicesService {
  async findAll(activeOnly = false) {
    const where = activeOnly ? { active: true } : {};

    return prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError('Service tidak ditemukan.', 404);
    }

    return service;
  }

  async create(data: CreateServiceInput) {
    return prisma.service.create({ data });
  }

  async update(id: string, data: UpdateServiceInput) {
    await this.findById(id);
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.service.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }
}

export const servicesService = new ServicesService();
