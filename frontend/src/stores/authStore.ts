import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token, user) => {
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const canEdit = (role: string): boolean => {
  return ['editor', 'manager', 'admin'].includes(role);
};

export const canDelete = (role: string): boolean => {
  return ['manager', 'admin'].includes(role);
};

export const canManage = (role: string): boolean => {
  return ['manager', 'admin'].includes(role);
};
