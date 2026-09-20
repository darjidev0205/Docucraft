import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ownershipMiddleware } from '../middleware/ownership.middleware';

const router = Router();

// All document routes require authentication
router.use(authMiddleware);

// Document collection
router.get('/', (req, res, next) => documentController.list(req, res, next));
router.post('/', (req, res, next) => documentController.create(req, res, next));

// Document item routes (protected by strict ownershipMiddleware)
router.get('/:id', ownershipMiddleware, (req, res) => documentController.get(req, res));
router.put('/:id', ownershipMiddleware, (req, res, next) => documentController.update(req, res, next));
router.post('/:id/duplicate', ownershipMiddleware, (req, res, next) => documentController.duplicate(req, res, next));
router.post('/:id/trash', ownershipMiddleware, (req, res, next) => documentController.moveToTrash(req, res, next));
router.post('/:id/restore', ownershipMiddleware, (req, res, next) => documentController.restore(req, res, next));
router.delete('/:id', ownershipMiddleware, (req, res, next) => documentController.deletePermanent(req, res, next));
router.post('/:id/favorite', ownershipMiddleware, (req, res, next) => documentController.toggleFavorite(req, res, next));

export default router;
