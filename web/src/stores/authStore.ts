import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, DashboardData } from '../types';

interface AuthState {
  user: User | null;
  dashboard: DashboardData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setDashboard: (dashboard: DashboardData | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      dashboard: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setDashboard: (dashboard) => set({ dashboard }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, dashboard: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, dashboard: state.dashboard }),
    }
  )
);