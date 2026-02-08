import { prisma } from '../../config/database.js';
import { AppError } from '../../middlewares/error.js';
import { CreatePostInput, UpdatePostInput, QueryPostsInput, CreateCategoryInput, UpdateCategoryInput } from './posts.schema.js';
import { parseQueryInt, parseQueryBoolean, slugify } from '../../utils/helpers.js';
import { Prisma } from '@prisma/client';

export class PostsService {
  async findAll(query: QueryPostsInput) {
    const page = parseQueryInt(query.page, 1);
    const limit = parseQueryInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    const featured = parseQueryBoolean(query.featured);
    if (featured !== undefined) {
      where.featured = featured;
    }

    const published = parseQueryBoolean(query.published);
    if (published !== undefined) {
      where.published = published;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { excerpt: { contains: query.q, mode: 'insensitive' } },
        { content: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.BlogPostOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      orderBy = { [field]: order === 'asc' ? 'asc' : 'desc' };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts, total, page, limit };
  }

  async findBySlug(slug: string, incrementViews = false) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post tidak ditemukan.', 404);
    }

    // Increment views
    if (incrementViews) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }

    return post;
  }

  /**
   * Generate a unique slug by appending -2, -3, etc. if the base slug exists
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await prisma.blogPost.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }
  }

  async findById(id: string) {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post tidak ditemukan.', 404);
    }

    return post;
  }

  async create(data: CreatePostInput, authorId: string) {
    const baseSlug = data.slug || slugify(data.title);
    const slug = await this.generateUniqueSlug(baseSlug);

    // Verify category exists
    const category = await prisma.blogCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Category tidak ditemukan.', 404);
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverUrl: data.coverUrl,
        categoryId: data.categoryId,
        authorId,
        tags: data.tags || [],
        readTime: data.readTime,
        featured: data.featured || false,
        published: data.published || false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : (data.published ? new Date() : null),
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return post;
  }

  async update(id: string, data: UpdatePostInput) {
    await this.findById(id);

    // Generate unique slug if provided
    let slug = data.slug;
    if (slug) {
      slug = await this.generateUniqueSlug(slug, id);
    }

    if (data.categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category tidak ditemukan.', 404);
      }
    }

    const { categoryId, slug: originalSlug, ...updateData } = data;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        ...(slug ? { slug } : {}),
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return post;
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.blogPost.delete({ where: { id } });
  }

  // Categories
  async findAllCategories() {
    return prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async createCategory(data: CreateCategoryInput) {
    const slug = data.slug || slugify(data.name);

    const existing = await prisma.blogCategory.findFirst({
      where: { OR: [{ slug }, { name: data.name }] },
    });

    if (existing) {
      throw new AppError('Category sudah ada.', 409);
    }

    return prisma.blogCategory.create({
      data: { name: data.name, slug },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await prisma.blogCategory.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category tidak ditemukan.', 404);
    }

    if (data.slug || data.name) {
      const existing = await prisma.blogCategory.findFirst({
        where: {
          OR: [
            { slug: data.slug || '' },
            { name: data.name || '' },
          ],
          NOT: { id },
        },
      });

      if (existing) {
        throw new AppError('Category sudah ada.', 409);
      }
    }

    return prisma.blogCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await prisma.blogCategory.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category tidak ditemukan.', 404);
    }

    // Check if category has posts
    const postsCount = await prisma.blogPost.count({ where: { categoryId: id } });
    if (postsCount > 0) {
      throw new AppError('Tidak dapat menghapus category yang memiliki posts.', 400);
    }

    await prisma.blogCategory.delete({ where: { id } });
  }
}

export const postsService = new PostsService();
