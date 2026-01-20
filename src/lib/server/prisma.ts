import type { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

async function createPrisma() {
  const { PrismaClient } = await import('@prisma/client');
  return new PrismaClient({ log: ['error', 'warn'] });
}

export const prismaPromise =
  globalForPrisma.prisma ? Promise.resolve(globalForPrisma.prisma) : createPrisma();

if (process.env.NODE_ENV !== 'production') {
  prismaPromise.then((p) => (globalForPrisma.prisma = p));
}
