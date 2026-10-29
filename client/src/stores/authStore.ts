import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('prezora_access_token'),
  isLoading: true,
  isAuthenticated: false,

  login: (userData, token, refreshToken) => {
    localStorage.setItem('prezora_access_token', token);
    if (refreshToken) {
      localStorage.setItem('prezora_refresh_token', refreshToken);
    }
    set({
      user: userData,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('prezora_access_token');
    localStorage.removeItem('prezora_refresh_token');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  updateUser: (updated) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null
    }));
  },

  initAuth: async () => {
    const token = localStorage.getItem('prezora_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err) {
      localStorage.removeItem('prezora_access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
