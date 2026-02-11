import { apiRequest } from './api';
import type { UserRole } from './types';

export type AuthResponse = {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export async function login(payload: {
  email: string;
  password: string;
  guestId?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  guestId?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

type ResetPasswordResponse = {
  message: string;
};

export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export async function getMe(
  token: string,
  signal?: AbortSignal
): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/auth/me', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
    signal
  });
}
