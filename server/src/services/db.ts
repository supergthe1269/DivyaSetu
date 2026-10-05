import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient for the whole API (avoids exhausting connections
// during the demo and is the standard pattern for an Express app).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Execute a single raw SQL SELECT and return rows (used for PostGIS matching). */
export function rawQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return prisma.$queryRawUnsafe<T[]>(sql, ...(params as any[]));
}

/** Execute a single raw SQL write (used for geometry back-fill / bootstrap ops). */
export async function rawExecute(sql: string, params: unknown[] = []): Promise<void> {
  await prisma.$executeRawUnsafe(sql, ...(params as any[]));
}