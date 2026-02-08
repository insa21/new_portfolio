import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  description: z.string().min(1, 'Description wajib diisi'),
  bestFor: z.string().min(1, 'Best for wajib diisi'),
  deliverables: z.array(z.string()).min(1, 'Minimal 1 deliverable'),
  process: z.array(z.string()).optional().default([]),
  order: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
