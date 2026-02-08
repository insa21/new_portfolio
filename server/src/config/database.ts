import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.IS_PRODUCTION ? ['error'] : ['query', 'error', 'warn'],
  });

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
