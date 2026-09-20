import { apiClient } from './api-client';
import { SignupInput, LoginInput, AuthResponse, UserProfile } from '@docucraft/shared';

export const authClient = {
  async signup(data: SignupInput): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/signup', data);
    apiClient.setToken(res.token);
    return res;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    apiClient.setToken(res.token);
    return res;
  },

  async me(): Promise<{ user: UserProfile } | null> {
    try {
      return await apiClient.get<{ user: UserProfile }>('/auth/me');
    } catch {
      return null;
    }
  },

  logout() {
    apiClient.setToken(null);
  },

  async forgotPassword(email: string) {
    return apiClient.post<{ message: string; devResetToken?: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },
};
