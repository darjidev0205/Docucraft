import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../../repositories/user.repository';
import { analyticsRepository } from '../../repositories/analytics.repository';
import { ENV } from '../../config/env';
import { SignupInput, LoginInput, AuthResponse } from '@docucraft/shared';

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'USER',
    });

    await analyticsRepository.trackEvent('SIGNUP', { userId: user.id });

    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    await analyticsRepository.trackEvent('LOGIN', { userId: user.id });

    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string; devResetToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success message to prevent user enumeration
      return { message: 'If an account exists with that email, a password reset link has been prepared.' };
    }

    await userRepository.deleteResetTokensForUser(user.id);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.createResetToken(user.id, token, expiresAt);

    return {
      message: 'If an account exists with that email, a password reset link has been prepared.',
      devResetToken: ENV.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async resetPassword(token: string, newPass: string): Promise<{ message: string }> {
    const resetRecord = await userRepository.findResetToken(token);
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await userRepository.updatePassword(resetRecord.userId, passwordHash);
    await userRepository.deleteResetTokensForUser(resetRecord.userId);

    return { message: 'Password has been successfully updated. You may now log in.' };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}

export const authService = new AuthService();
