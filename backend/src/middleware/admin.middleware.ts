import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
  }
  next();
}
