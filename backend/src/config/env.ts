import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current dir

/**
 * Normalizes MongoDB connection strings so an empty database name
 * (e.g. mongodb+srv://user:pass@cluster0.mongodb.net/?appName=...)
 * is safely resolved to "...mongodb.net/docucraft?..." to prevent
 * "AtlasError: empty database name not allowed".
 */
export function normalizeDatabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  if (url.startsWith('mongodb')) {
    // If there is no database name before '?' or at the end of the host
    if (/\.mongodb\.net\/\?/.test(url)) {
      url = url.replace('.mongodb.net/?', '.mongodb.net/docucraft?');
    } else if (/\.mongodb\.net\/$/.test(url)) {
      url = `${url}docucraft?retryWrites=true&w=majority`;
    } else if (/\.mongodb\.net$/.test(url)) {
      url = `${url}/docucraft?retryWrites=true&w=majority`;
    }
  }

  return url;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'docucraft-super-secure-production-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@docucraft.io',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://docucraft-frontend.vercel.app',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
};
