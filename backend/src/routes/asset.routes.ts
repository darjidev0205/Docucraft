import { Router } from 'express';
import { assetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ownershipMiddleware } from '../middleware/ownership.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Upload asset for document
router.post(
  '/:id/assets',
  authMiddleware,
  ownershipMiddleware,
  uploadMiddleware.single('file'),
  (req, res, next) => assetController.upload(req, res, next)
);

// Delete asset
router.delete(
  '/:id/assets/:assetId',
  authMiddleware,
  ownershipMiddleware,
  (req, res, next) => assetController.delete(req, res, next)
);

export default router;
