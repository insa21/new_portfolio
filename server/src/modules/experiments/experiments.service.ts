import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreateExperimentInput, UpdateExperimentInput, QueryExperimentsInput } from './experiments.schema.js';
import { parseQueryInt } from '../../utils/helpers.js';
import { Prisma } from '@prisma/client';

export class ExperimentsService {
  async findAll(query: QueryExperimentsInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ExperimentWhereInput = {};

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [experiments, total] = await Promise.all([
      prisma.experiment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.experiment.count({ where }),
    ]);

    return { experiments, total, page, limit };
  }

  async findById(id: string) {
    const experiment = await prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      throw new AppError('Experiment tidak ditemukan.', 404);
    }

    return experiment;
  }

  async create(data: CreateExperimentInput) {
    return prisma.experiment.create({ data });
  }

  async update(id: string, data: UpdateExperimentInput) {
    await this.findById(id);
    return prisma.experiment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.experiment.delete({ where: { id } });
  }
}

export const experimentsService = new ExperimentsService();
