import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreateCertificationInput, UpdateCertificationInput, QueryCertificationsInput } from './certifications.schema.js';
import { parseQueryInt, parseQueryBoolean } from '../../utils/helpers.js';
import { CredentialType, Prisma } from '@prisma/client';

export class CertificationsService {
  async findAll(query: QueryCertificationsInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.CertificationWhereInput = {};

    if (query.type) {
      where.type = query.type as CredentialType;
    }

    if (query.category) {
      where.category = query.category;
    }

    const featured = parseQueryBoolean(query.featured);
    if (featured !== undefined) {
      where.featured = featured;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { issuer: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.certification.count({ where }),
    ]);

    return { certifications, total, page, limit };
  }

  async findById(id: string) {
    const certification = await prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      throw new AppError('Certification tidak ditemukan.', 404);
    }

    return certification;
  }

  async create(data: CreateCertificationInput) {
    const certification = await prisma.certification.create({
      data: {
        ...data,
        type: data.type as CredentialType,
      },
    });

    return certification;
  }

  async update(id: string, data: UpdateCertificationInput) {
    await this.findById(id);

    const certification = await prisma.certification.update({
      where: { id },
      data: {
        ...data,
        type: data.type as CredentialType,
      },
    });

    return certification;
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.certification.delete({ where: { id } });
  }
}

export const certificationsService = new CertificationsService();
