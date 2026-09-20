import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ENV } from '../config/env';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../config/storage';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomHex}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and SVG images are allowed.'));
    }
  },
});
