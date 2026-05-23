import axios from 'axios';
import { handleMockRequest, isGitHubPages } from './mockApi';

const useMock = isGitHubPages();

if (useMock) {
  console.log('[Mock API] Active - running in demo mode');
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

if (useMock) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const mockReq = {
      method: (config.method || 'get').toUpperCase(),
      url: config.url || '',
      data: config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : undefined,
      params: config.params,
      headers: config.headers as Record<string, string>,
    };
    const mockResponse = handleMockRequest(mockReq);
    if (mockResponse.status >= 200 && mockResponse.status < 300) {
      config.adapter = () => {
        return Promise.resolve({
          data: mockResponse.data,
          status: mockResponse.status,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
        });
      };
    } else {
      config.adapter = () => {
        return Promise.reject({
          response: {
            data: mockResponse.data,
            status: mockResponse.status,
            statusText: 'Error',
            headers: { 'content-type': 'application/json' },
            config,
          },
          config,
        });
      };
    }
    return config;
  });
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (useMock) return Promise.reject(error);
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
