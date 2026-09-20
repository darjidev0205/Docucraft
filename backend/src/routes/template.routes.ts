import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Public template endpoints
router.get('/', (req, res, next) => templateController.list(req, res, next));
router.get('/:id', (req, res, next) => templateController.get(req, res, next));

// Admin template mutation
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  templateController.createOrUpdate(req, res, next);
});

export default router;
