import { PrismaClient } from '@prisma/client';
import { ENV } from './env';

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.prismaClient ||
  new PrismaClient({
    log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (ENV.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

/**
 * Safe database connectivity check for startup diagnostics.
 * Logs success or error WITHOUT exposing connection credentials.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    // Verify query responsiveness
    await prisma.user.count();
    console.log('✅ MongoDB Atlas: Connected and authenticated successfully.');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection error:', error.message || error);
    return false;
  }
}
