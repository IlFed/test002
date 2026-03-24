import { create } from 'zustand';
import { login as apiLogin } from '../api/api';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (username: string, password: string, rememberMe: boolean) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(username, password);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', data.accessToken);
      storage.setItem('refreshToken', data.refreshToken);
      storage.setItem('username', data.username);

      // Clean the other storage
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('accessToken');
      otherStorage.removeItem('refreshToken');
      otherStorage.removeItem('username');

      set({
        token: data.accessToken,
        username: data.username,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Ошибка авторизации',
      });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('username');
    set({
      token: null,
      username: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const username =
      localStorage.getItem('username') ||
      sessionStorage.getItem('username');

    if (token) {
      set({
        token,
        username,
        isAuthenticated: true,
      });
    }
  },
}));
