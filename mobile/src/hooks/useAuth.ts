import { useState, useEffect, useCallback } from 'react';
import { getUser as getStoredUser, clearAuth } from '../lib/auth';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  first_name: string;
  last_name: string;
  phone?: string;
  status?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredUser();
        if (stored) {
          const res = await api.get('/users/me');
          setUser(res.data);
        }
      } catch { } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setUser(null);
  }, []);

  return { user, loading, logout, setUser };
}
