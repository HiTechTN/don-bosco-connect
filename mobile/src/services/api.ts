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

  async getGrades(studentId: string) {
    return [
      { id: 'g1', student_id: studentId, subject_name: 'Mathématiques', evaluation_title: 'Contrôle continu', score: 16, graded_at: '2025-05-10' },
      { id: 'g2', student_id: studentId, subject_name: 'Physique', evaluation_title: 'Devoir maison', score: 14, graded_at: '2025-05-08' },
      { id: 'g3', student_id: studentId, subject_name: 'Français', evaluation_title: 'Expression écrite', score: 15, graded_at: '2025-05-05' },
      { id: 'g4', student_id: studentId, subject_name: 'Anglais', evaluation_title: 'Test oral', score: 17, graded_at: '2025-05-03' },
      { id: 'g5', student_id: studentId, subject_name: 'Histoire-Géo', evaluation_title: 'Quiz', score: 13, graded_at: '2025-04-28' },
      { id: 'g6', student_id: studentId, subject_name: 'Sciences', evaluation_title: 'TP', score: 15.5, graded_at: '2025-04-25' },
    ];
  },

  async getQuizzes() {
    return [
      { id: 'q1', title: 'Mathématiques - Algèbre', difficulty: 'Facile', question_count: 10 },
      { id: 'q2', title: 'Physique - Mécanique', difficulty: 'Moyen', question_count: 8 },
      { id: 'q3', title: 'Anglais - Vocabulary', difficulty: 'Facile', question_count: 15 },
      { id: 'q4', title: 'Histoire - Antiquité', difficulty: 'Difficile', question_count: 12 },
    ];
  },

  async getQuizQuestions(quizId: string) {
    const questions: Record<string, any[]> = {
      q1: [
        { id: 'qq1', question_text: 'Combien fait 2 + 2 ?', options: [{ text: '4' }, { text: '3' }, { text: '5' }, { text: '6' }] },
        { id: 'qq2', question_text: 'Résolvez: x + 5 = 10', options: [{ text: 'x = 3' }, { text: 'x = 5' }, { text: 'x = 7' }, { text: 'x = 4' }] },
        { id: 'qq3', question_text: 'Quelle est la racine carrée de 16 ?', options: [{ text: '2' }, { text: '4' }, { text: '8' }, { text: '6' }] },
      ],
      q2: [
        { id: 'qq4', question_text: 'Quelle est la vitesse de la lumière ?', options: [{ text: '300 000 km/s' }, { text: '150 000 km/s' }, { text: '500 000 km/s' }, { text: '100 000 km/s' }] },
        { id: 'qq5', question_text: 'Formule de la force ?', options: [{ text: 'F = ma' }, { text: 'F = m/a' }, { text: 'F = m+a' }, { text: 'F = m²a' }] },
      ],
      q3: [
        { id: 'qq6', question_text: 'Comment dit-on "hello" en anglais ?', options: [{ text: 'Bonjour' }, { text: 'Merci' }, { text: 'Au revoir' }, { text: 'Salut' }] },
      ],
      q4: [
        { id: 'qq7', question_text: 'Qui a fondé Rome ?', options: [{ text: 'Romulus et Remus' }, { text: 'César' }, { text: 'Néron' }, { text: 'Auguste' }] },
      ],
    };
    return questions[quizId] || [];
  },

  async getGamificationProfile(studentId: string) {
    return { level: 5, xp_total: 2450, streak_days: 7 };
  },

  async getGamificationBadges(studentId: string) {
    return [
      { id: 'b1', name: 'Premier Quiz', xp_reward: 50 },
      { id: 'b2', name: 'Série de 7 jours', xp_reward: 100 },
      { id: 'b3', name: 'Top 10', xp_reward: 200 },
    ];
  },

  async getGamificationLeaderboard(studentId: string) {
    return [
      { rank: 1, first_name: 'Adam', last_name: 'Slim', level: 5, xp_total: 2450 },
      { rank: 2, first_name: 'Mariem', last_name: 'Beldi', level: 4, xp_total: 2100 },
      { rank: 3, first_name: 'Youssef', last_name: 'Mansour', level: 4, xp_total: 1950 },
      { rank: 4, first_name: 'Nour', last_name: 'Saidi', level: 3, xp_total: 1800 },
      { rank: 5, first_name: 'Ahmed', last_name: 'Khalil', level: 3, xp_total: 1650 },
    ];
  },

  async getGamificationXpHistory(studentId: string) {
    return [
      { id: 'xh1', amount: 100, reason: 'Quiz complété: Mathématiques', created_at: '2025-05-15' },
      { id: 'xh2', amount: 50, reason: 'Présence，连续7天', created_at: '2025-05-14' },
      { id: 'xh3', amount: 75, reason: 'Bonne réponse rapide', created_at: '2025-05-13' },
    ];
  },

  async getAbsences(studentId: string) {
    return [
      { id: 'a1', student_id: studentId, date: '2025-05-12', justification_status: 'justified', type: 'absence', subject_name: 'Mathématiques' },
      { id: 'a2', student_id: studentId, date: '2025-05-08', justification_status: 'pending', type: 'absence', subject_name: 'Physique' },
      { id: 'a3', student_id: studentId, date: '2025-05-02', justification_status: 'unjustified', type: 'retard', subject_name: 'Français' },
    ];
  },

  async getTimetable() {
    return [
      { id: 't1', day: 'monday', start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Karim Hamdi', subject_color: '#4F46E5' },
      { id: 't2', day: 'monday', start_time: '09:00', end_time: '10:00', subject_name: 'Physique', teacher_name: 'Slah Mansour', subject_color: '#059669' },
      { id: 't3', day: 'monday', start_time: '10:00', end_time: '11:00', subject_name: 'Français', teacher_name: 'Nadia Trabelsi', subject_color: '#D97706' },
      { id: 't4', day: 'tuesday', start_time: '08:00', end_time: '09:00', subject_name: 'Anglais', teacher_name: 'Sonia Ben Ali', subject_color: '#EC4899' },
      { id: 't5', day: 'tuesday', start_time: '09:00', end_time: '10:00', subject_name: 'Histoire-Géo', teacher_name: 'Hichem Yaakoub', subject_color: '#8B5CF6' },
      { id: 't6', day: 'wednesday', start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Slah Mansour', subject_color: '#14B8A6' },
      { id: 't7', day: 'wednesday', start_time: '09:00', end_time: '10:00', subject_name: 'Mathématiques', teacher_name: 'Karim Hamdi', subject_color: '#4F46E5' },
      { id: 't8', day: 'thursday', start_time: '08:00', end_time: '09:00', subject_name: 'Physique', teacher_name: 'Slah Mansour', subject_color: '#059669' },
      { id: 't9', day: 'thursday', start_time: '09:00', end_time: '10:00', subject_name: 'Sport', teacher_name: 'Med Salah', subject_color: '#DC2626' },
      { id: 't10', day: 'friday', start_time: '08:00', end_time: '09:00', subject_name: 'Anglais', teacher_name: 'Sonia Ben Ali', subject_color: '#EC4899' },
      { id: 't11', day: 'friday', start_time: '09:00', end_time: '10:00', subject_name: 'Mathématiques', teacher_name: 'Karim Hamdi', subject_color: '#4F46E5' },
    ];
  },

  async getMessages() {
    return [
      { id: 'm1', sender_id: 'teacher-uuid-001', receiver_id: 'student-uuid-001', content: 'Bonjour Adam, n\'oublie pas le contrôle demain !', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'm2', sender_id: 'student-uuid-001', receiver_id: 'teacher-uuid-001', content: 'Merci M. Hamdi, je serai prêt.', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 'm3', sender_id: 'teacher-uuid-001', receiver_id: 'student-uuid-001', content: 'Bien ! Courage pour ton examen.', created_at: new Date(Date.now() - 600000).toISOString() },
    ];
  },

  async getUsers() {
    return [
      { id: 'teacher-uuid-001', first_name: 'Karim', last_name: 'Hamdi', role: 'teacher' },
      { id: 'admin-uuid-0001', first_name: 'Admin', last_name: 'Principal', role: 'admin' },
      { id: 'parent-uuid-001', first_name: 'Ahmed', last_name: 'Slim', role: 'parent' },
    ];
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