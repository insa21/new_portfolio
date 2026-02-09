import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreateProjectInput, UpdateProjectInput, QueryProjectsInput } from './projects.schema.js';
import { parseQueryInt, parseQueryBoolean, slugify } from '../../utils/helpers.js';
import { ProjectStatus, Prisma } from '@prisma/client';

export class ProjectsService {
  async findAll(query: QueryProjectsInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status as ProjectStatus;
    }

    const featured = parseQueryBoolean(query.featured);
    if (featured !== undefined) {
      where.featured = featured;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { tagline: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    // Sort
    let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      orderBy = { [field]: order === 'asc' ? 'asc' : 'desc' };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tags: {
            select: { tag: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Transform tags
    const transformedProjects = projects.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
    }));

    return { projects: transformedProjects, total, page, limit };
  }

  async findBySlug(slug: string) {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        tags: {
          select: { tag: true },
        },
      },
    });

    if (!project) {
      throw new AppError('Project tidak ditemukan.', 404);
    }

    return {
      ...project,
      tags: project.tags.map((t) => t.tag),
    };
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tags: {
          select: { tag: true },
        },
      },
    });

    if (!project) {
      throw new AppError('Project tidak ditemukan.', 404);
    }

    return {
      ...project,
      tags: project.tags.map((t) => t.tag),
    };
  }

  async create(data: CreateProjectInput) {
    const slug = data.slug || slugify(data.title);

    // Check slug exists
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      throw new AppError('Slug sudah digunakan.', 409);
    }

    const { tags, ...projectData } = data;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        slug,
        status: data.status as ProjectStatus,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        tags: {
          create: tags?.map((tag) => ({ tag })) || [],
        },
      },
      include: {
        tags: {
          select: { tag: true },
        },
      },
    });

    return {
      ...project,
      tags: project.tags.map((t: { tag: string }) => t.tag),
    };
  }

  async update(id: string, data: UpdateProjectInput) {
    await this.findById(id);

    const { tags, ...projectData } = data;

    // If slug is being updated, check uniqueness
    if (data.slug) {
      const existingProject = await prisma.project.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });

      if (existingProject) {
        throw new AppError('Slug sudah digunakan.', 409);
      }
    }

    // Update project and tags in transaction
    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing tags if new tags provided
      if (tags) {
        await tx.projectTag.deleteMany({
          where: { projectId: id },
        });
      }

      // Update project
      return tx.project.update({
        where: { id },
        data: {
          ...projectData,
          status: data.status as ProjectStatus,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
          tags: tags
            ? {
              create: tags.map((tag) => ({ tag })),
            }
            : undefined,
        },
        include: {
          tags: {
            select: { tag: true },
          },
        },
      });
    });

    return {
      ...project,
      tags: project.tags.map((t: { tag: string }) => t.tag),
    };
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.project.delete({
      where: { id },
    });
  }
}

export const projectsService = new ProjectsService();
