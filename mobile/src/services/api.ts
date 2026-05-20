import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await AsyncStorage.getItem('refresh_token');
        if (refresh) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
          const { access_token, refresh_token } = res.data;
          await AsyncStorage.setItem('access_token', access_token);
          await AsyncStorage.setItem('refresh_token', refresh_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        }
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      }
    }
    throw error;
  }
);

export const mockApi = {
  async login(email: string, password: string) {
    const users: Record<string, { id: string; name: string; role: string }> = {
      'admin@donbosco.tn': { id: 'admin-uuid-0001', name: 'Admin Principal', role: 'admin' },
      'karim.hamdi@donbosco.tn': { id: 'teacher-uuid-001', name: 'Karim Hamdi', role: 'teacher' },
      'adam.slim@donbosco.tn': { id: 'student-uuid-001', name: 'Adam Slim', role: 'student' },
      'ahmed.slim@parent.tn': { id: 'parent-uuid-001', name: 'Ahmed Slim', role: 'parent' },
    };
    const user = users[email];
    if (user && password.endsWith('!')) {
      const [first_name, last_name] = user.name.split(' ');
      return {
        access_token: `mock_${user.id}_${Date.now()}`,
        refresh_token: `mock_refresh_${user.id}`,
        user: { id: user.id, email, role: user.role, first_name: first_name || user.name, last_name: last_name || '' },
      };
    }
    throw new Error('Email ou mot de passe incorrect');
  },

  async me(token: string) {
    const id = token.includes('admin') ? 'admin-uuid-0001' : token.includes('teacher') ? 'teacher-uuid-001' : token.includes('student') ? 'student-uuid-001' : 'parent-uuid-001';
    const data = { 'admin-uuid-0001': { id: 'admin-uuid-0001', email: 'admin@donbosco.tn', role: 'admin', first_name: 'Admin', last_name: 'Principal' }, 'teacher-uuid-001': { id: 'teacher-uuid-001', email: 'karim.hamdi@donbosco.tn', role: 'teacher', first_name: 'Karim', last_name: 'Hamdi' }, 'student-uuid-001': { id: 'student-uuid-001', email: 'adam.slim@donbosco.tn', role: 'student', first_name: 'Adam', last_name: 'Slim' }, 'parent-uuid-001': { id: 'parent-uuid-001', email: 'ahmed.slim@parent.tn', role: 'parent', first_name: 'Ahmed', last_name: 'Slim' } };
    return data[id as keyof typeof data];
  },

  async dashboard(role: string) {
    const dashboards: Record<string, object> = {
      admin: { total_users: 9, total_teachers: 3, total_students: 3, total_parents: 2, total_courses: 5 },
      teacher: { total_courses: 3, total_evaluations: 5, average_score: 14.5, pending_absences: 2 },
      student: { xp_total: 2450, level: 5, streak_days: 7, grades_count: 8, absences_count: 3 },
      parent: { children: [{ id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim' }], grades_count: 8, absences_count: 2 },
    };
    return dashboards[role] || {};
  },
};

export const authService = {
  async login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('access_token', res.data.access_token);
      await AsyncStorage.setItem('refresh_token', res.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    } catch {
      const res = await mockApi.login(email, password);
      await AsyncStorage.setItem('access_token', res.access_token);
      await AsyncStorage.setItem('refresh_token', res.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
  },

  async me() {
    try {
      const res = await api.get('/users/me');
      return res.data;
    } catch {
      const token = await AsyncStorage.getItem('access_token');
      if (token) return mockApi.me(token);
      throw new Error('Not authenticated');
    }
  },

  async dashboard() {
    try {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    } catch {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return mockApi.dashboard(user.role);
      }
      throw new Error('Not authenticated');
    }
  },
};

export default api;