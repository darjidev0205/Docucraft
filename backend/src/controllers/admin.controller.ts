import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { analyticsRepository } from '../repositories/analytics.repository';
import { userRepository } from '../repositories/user.repository';
import { prisma } from '../config/database';

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsRepository.getAdminStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const users = await userRepository.listAll(limit, offset);
      const total = await userRepository.countTotal();
      res.status(200).json({ users, total });
    } catch (error) {
      next(error);
    }
  }

  async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { pdfExports: true },
            },
          },
        }),
        prisma.document.count(),
      ]);
      res.status(200).json({ documents, total });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
