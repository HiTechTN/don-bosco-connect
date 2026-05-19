import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  dashboard: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setDashboard: (dashboard) => set({ dashboard }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, dashboard: null, isAuthenticated: false }),
}));