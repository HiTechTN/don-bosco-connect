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
    // Tokens are now stored in HttpOnly cookies set by the server
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    // Clear any legacy localStorage tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
