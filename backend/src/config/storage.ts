import fs from 'fs';
import path from 'path';
import { ENV } from './env';

// Ensure uploads directory exists
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export const MAX_FILE_SIZE = ENV.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
