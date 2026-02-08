import { prisma } from '../../config/database.js';
import { hashPassword } from '../../utils/hash.js';
import { AppError } from '../../middlewares/error.js';
import { CreateUserInput, UpdateUserInput, QueryUsersInput } from './users.schema.js';
import { parseQueryInt } from '../../utils/helpers.js';
import { User, UserRole } from '@prisma/client';

export class UsersService {
  async findAll(query: QueryUsersInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: { role?: UserRole; OR?: { email?: { contains: string; mode: 'insensitive' }; name?: { contains: string; mode: 'insensitive' } }[] } = {};

    if (query.role) {
      where.role = query.role as UserRole;
    }

    if (query.q) {
      where.OR = [
        { email: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan.', 404);
    }

    return user;
  }

  async create(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar.', 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role as UserRole || UserRole.EDITOR,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id);

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role as UserRole,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.user.delete({
      where: { id },
    });
  }
}

export const usersService = new UsersService();
