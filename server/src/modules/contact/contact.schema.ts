import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  subject: z.string().min(1, 'Subject wajib diisi'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

export const queryContactSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  read: z.string().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type QueryContactInput = z.infer<typeof queryContactSchema>;
