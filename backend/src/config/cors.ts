import cors from 'cors';
import { ENV } from './env';

const configuredOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://docucraft-frontend.vercel.app',
  ENV.FRONTEND_URL,
  ...(ENV.CORS_ORIGIN ? ENV.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
].filter(Boolean) as string[];

export const allowedOrigins = Array.from(new Set(configuredOrigins));

export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
  if (!origin) return true;

  // Direct match in allowlist
  if (allowedOrigins.includes(origin)) return true;

  // Pattern match for Vercel preview/branch deployments
  if (/^https:\/\/docucraft-frontend(-[a-zA-Z0-9_-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/docucraft(-[a-zA-Z0-9_-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/docucraft-.*-darjidev0205s-projects\.vercel\.app$/.test(origin)) return true;

  return false;
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 204,
};
