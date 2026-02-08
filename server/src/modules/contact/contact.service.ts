import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreateContactInput, QueryContactInput } from './contact.schema.js';
import { parseQueryInt, parseQueryBoolean } from '../../utils/helpers.js';
import { Prisma } from '@prisma/client';

export class ContactService {
  async create(data: CreateContactInput, ipAddress?: string) {
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    return submission;
  }

  async findAll(query: QueryContactInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ContactSubmissionWhereInput = {};

    const read = parseQueryBoolean(query.read);
    if (read !== undefined) {
      where.read = read;
    }

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return { submissions, total, page, limit };
  }

  async findById(id: string) {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new AppError('Pesan tidak ditemukan.', 404);
    }

    return submission;
  }

  async markAsRead(id: string) {
    await this.findById(id);

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { read: true },
    });

    return submission;
  }

  async markAsUnread(id: string) {
    await this.findById(id);

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { read: false },
    });

    return submission;
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.contactSubmission.delete({ where: { id } });
  }

  async getUnreadCount() {
    const count = await prisma.contactSubmission.count({
      where: { read: false },
    });

    return { count };
  }
}

export const contactService = new ContactService();
