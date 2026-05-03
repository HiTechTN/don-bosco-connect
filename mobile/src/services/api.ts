import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/accounts/users/login/', { username, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/accounts/users/me/');
    return response.data;
  },
  dashboard: async () => {
    const response = await api.get('/accounts/users/dashboard/');
    return response.data;
  },
};

export const coursesService = {
  getCourses: async () => {
    const response = await api.get('/courses/');
    return response.data;
  },
  getCourse: async (id: number) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },
};

export const assignmentsService = {
  getAssignments: async () => {
    const response = await api.get('/assignments/');
    return response.data;
  },
  getQuizzes: async () => {
    const response = await api.get('/assignments/quizzes/');
    return response.data;
  },
};

export const aiService = {
  chat: async (message: string, courseId?: number) => {
    const response = await api.post('/ai/chat/chat/', { message, course_id: courseId });
    return response.data;
  },
  getMyLevel: async (courseId: number) => {
    const response = await api.get('/ai/content/my_level/', { params: { course_id: courseId } });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/ai/analytics/student_analytics/');
    return response.data;
  },
};

export default api;