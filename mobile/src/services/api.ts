import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '../lib/auth';

const BASE_URL = 'http://donbosco.local/api/v1';
// Change to your server's URL for production
// const BASE_URL = __DEV__ ? 'http://donbosco.local/api/v1' : 'https://api.donbosco.tn/api/v1';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = await getRefreshToken();
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
        const { access_token, refresh_token } = res.data;
        await saveTokens(access_token, refresh_token);
        processQueue(null, access_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await clearAuth();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export default api;