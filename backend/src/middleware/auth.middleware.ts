import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { userRepository } from '../repositories/user.repository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token.' });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    const userId = decoded?.userId || decoded?.id;
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(401).json({ error: 'Invalid session payload.' });
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'User account not found or session expired.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export async function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
      const userId = decoded?.userId || decoded?.id;
      if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
        const user = await userRepository.findById(userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          };
        }
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
}
