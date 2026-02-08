import { z } from 'zod';

// Helper to accept null as empty string
const nullableString = z.string().nullable().transform(val => val ?? '');
const nullableUrl = z.string().url().nullable().or(z.literal('')).or(z.literal(null)).transform(val => val ?? '');
const nullableNumber = z.number().nullable().optional();

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  slug: z.string().optional().nullable().transform(val => val ?? ''),
  tagline: z.string().min(1, 'Tagline wajib diisi'),
  description: z.string().min(1, 'Description wajib diisi'),
  type: z.string().min(1, 'Type wajib diisi'),
  featured: z.boolean().optional().default(false),
  status: z.enum(['LIVE', 'IN_PROGRESS', 'ARCHIVED']).optional().default('IN_PROGRESS'),
  year: z.union([z.string(), z.number()]).transform(val => String(val)),
  stack: z.array(z.string()).min(1, 'Stack minimal 1 item'),
  tags: z.array(z.string()).optional().default([]),
  thumbnailUrl: nullableString.optional(),
  previewType: z.string().optional().default('image'),
  liveUrl: z.string().optional().nullable().transform(val => val ?? ''),
  repoUrl: z.string().optional().nullable().transform(val => val ?? ''),
  caseStudyUrl: nullableString.optional(),
  stars: nullableNumber,
  views: nullableNumber,
  highlights: z.array(z.string()).optional().default([]),
  challenges: nullableString.optional(),
  results: nullableString.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const queryProjectsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['LIVE', 'IN_PROGRESS', 'ARCHIVED']).optional(),
  featured: z.string().optional(),
  sort: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type QueryProjectsInput = z.infer<typeof queryProjectsSchema>;
