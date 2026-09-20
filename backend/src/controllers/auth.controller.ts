import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth/auth.service';
import { userRepository } from '../repositories/user.repository';
import { SignupSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@docucraft/shared';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = SignupSchema.parse(req.body);
      const result = await authService.signup(validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = await authService.login(validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = ForgotPasswordSchema.parse(req.body);
      const result = await authService.requestPasswordReset(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = ResetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
