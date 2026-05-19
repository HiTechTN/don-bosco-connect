import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useApi<T>(endpoint: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetch(); }, deps);

  const refetch = () => fetch();

  return { data, loading, error, refetch };
}
