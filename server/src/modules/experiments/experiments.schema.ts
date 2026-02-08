import { z } from 'zod';

export const createExperimentSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  description: z.string().min(1, 'Description wajib diisi'),
  tags: z.array(z.string()).optional().default([]),
  date: z.string().min(1, 'Date wajib diisi'),
  previewUrl: z.string().optional(),
  repoUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
});

export const updateExperimentSchema = createExperimentSchema.partial();

export const queryExperimentsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>;
export type QueryExperimentsInput = z.infer<typeof queryExperimentsSchema>;
