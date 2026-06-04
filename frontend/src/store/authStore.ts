import { create } from 'zustand';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => {
    // HttpOnly cookies are set by the server on /auth/login
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    // Server-side: call /auth/logout to clear HttpOnly cookies
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    set({ user: null, isAuthenticated: false });
    if (logoutCallback) {
      logoutCallback();
    } else {
      window.location.href = '/login';
    }
  },
  setUser: (user) => set({ user }),
}));
