import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.get('/documents', (req, res, next) => adminController.listDocuments(req, res, next));

export default router;
