import { z } from 'zod';

// Helper to accept null as empty string
const nullableString = z.string().nullable().transform(val => val ?? '');

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  slug: z.string().optional().nullable().transform(val => val ?? ''),
  excerpt: z.string().min(1, 'Excerpt wajib diisi'),
  content: z.string().min(1, 'Content wajib diisi'),
  coverUrl: nullableString.optional(),
  thumbnailUrl: nullableString.optional(), // Alias for coverUrl from new page
  categoryId: z.string().min(1, 'Category wajib dipilih'),
  tags: z.array(z.string()).optional().default([]),
  readTime: z.union([z.string(), z.number()]).optional().transform(val => {
    if (typeof val === 'number') return String(val);
    return val ?? '';
  }),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  // SEO fields
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial();

export const queryPostsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  featured: z.string().optional(),
  published: z.string().optional(),
  sort: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama category wajib diisi'),
  slug: z.string().optional().nullable().transform(val => val ?? ''),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type QueryPostsInput = z.infer<typeof queryPostsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
