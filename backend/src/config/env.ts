import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current dir

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'docucraft-super-secure-production-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@docucraft.io',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://docucraft-frontend.vercel.app',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
};
