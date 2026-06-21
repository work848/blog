import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout } from '@/api/auth';
import type { LoginRequest, LoginResponse } from '@/types';

interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '登录失败',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    apiLogout();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch {
        apiLogout();
      }
    }
  },
}));
