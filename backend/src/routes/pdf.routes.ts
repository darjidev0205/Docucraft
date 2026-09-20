import { Router } from 'express';
import { pdfController } from '../controllers/pdf.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ownershipMiddleware } from '../middleware/ownership.middleware';

const router = Router();

// Protected: Requires valid user session AND ownership of the document
router.post('/:id/download', authMiddleware, ownershipMiddleware, (req, res, next) => {
  pdfController.download(req, res, next);
});

// Protected preview HTML route
router.post('/:id/preview-html', authMiddleware, ownershipMiddleware, (req, res, next) => {
  pdfController.previewHtml(req, res, next);
});

export default router;
