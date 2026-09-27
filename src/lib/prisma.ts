import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Prisma Accelerate (HTTP) when DATABASE_URL is a prisma:// URL — required on
// Cloudflare Workers (no native engine binaries). Plain sqlite/postgres URLs
// (local dev) bypass Accelerate automatically.
// Build/runtime-safe: an empty DATABASE_URL crashes Prisma with P1012 even on
// code paths that never touch the DB (env is validated eagerly). Fall back to
// a local sqlite path so only routes that actually query can fail.
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:./prisma/dev.db';

const prismaClientSingleton = () =>
  new PrismaClient({ log: ['error'] }).$extends(withAccelerate());

type PrismaClientExtended = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientExtended;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
