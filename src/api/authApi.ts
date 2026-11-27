import { apiRequest } from './client';

export interface AuthUserDto {
  id: string;
  fullName: string;
  email: string;
  initials: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUserDto;
}

export interface ForgotPasswordResponseDto {
  message: string;
  devCode?: string | null;
}

export const authApi = {
  register(fullName: string, email: string, password: string): Promise<AuthResponseDto> {
    return apiRequest<AuthResponseDto>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponseDto> {
    return apiRequest<AuthResponseDto>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  },

  forgotPassword(email: string): Promise<ForgotPasswordResponseDto> {
    return apiRequest<ForgotPasswordResponseDto>('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(email: string, code: string, newPassword: string): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }>('/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  getMe(): Promise<AuthUserDto> {
    return apiRequest<AuthUserDto>('/auth/me', {
      method: 'GET',
      auth: true,
    });
  },
};
