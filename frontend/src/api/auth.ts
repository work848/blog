import { request } from './client';
import type { LoginRequest, LoginResponse } from '@/types';

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return request<LoginResponse>({
    method: 'POST',
    url: '/auth/login',
    data,
  });
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): LoginResponse['user'] | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
