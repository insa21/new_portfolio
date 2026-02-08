import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['ADMIN', 'EDITOR']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  role: z.enum(['ADMIN', 'EDITOR']).optional(),
  avatar: z.string().url().nullable().optional(),
});

export const queryUsersSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(['ADMIN', 'EDITOR']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
