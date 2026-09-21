import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { ENV } from './config/env';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import pdfRoutes from './routes/pdf.routes';
import assetRoutes from './routes/asset.routes';
import templateRoutes from './routes/template.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// 1. CORS - MUST be first middleware so all preflight OPTIONS and actual requests receive correct headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Body parser
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate limiting (generous for local dev & production usage)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Static file serving for uploaded document assets
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DocuCraft API',
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', pdfRoutes);
app.use('/api/documents', assetRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);

// Root path aliases (defense-in-depth against client prefix omissions)
app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);
app.use('/documents', pdfRoutes);
app.use('/documents', assetRoutes);
app.use('/templates', templateRoutes);
app.use('/admin', adminRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`🚀 DocuCraft Backend running on port ${PORT}`);
  console.log(`📁 Upload directory: ${ENV.UPLOAD_DIR}`);
  console.log(`🔒 Environment: ${ENV.NODE_ENV}`);
});

export default app;
