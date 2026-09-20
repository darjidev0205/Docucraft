import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations in node
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.prismaClient ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}
