import { z } from 'zod';

export const createCertificationSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  type: z.enum(['LICENSE', 'CERTIFICATION']).optional().default('CERTIFICATION'),
  issuer: z.string().min(1, 'Issuer wajib diisi'),
  issuerLogo: z.string().optional(),
  category: z.string().min(1, 'Category wajib diisi'),
  skills: z.array(z.string()).optional().default([]),
  issuedAt: z.string().min(1, 'Issued date wajib diisi'),
  expiresAt: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  pdfUrl: z.string().optional(),
  featured: z.boolean().optional().default(false),
  description: z.string().optional(),
  previewUrl: z.string().optional(),
  previewType: z.enum(['pdf', 'image']).optional().default('image'),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export const queryCertificationsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(['LICENSE', 'CERTIFICATION']).optional(),
  category: z.string().optional(),
  featured: z.string().optional(),
});

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
export type QueryCertificationsInput = z.infer<typeof queryCertificationsSchema>;
