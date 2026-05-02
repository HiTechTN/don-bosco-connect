import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
      window.location.href = '/login';
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
  register: async (data: { username: string; email: string; password: string; role: string }) => {
    const response = await api.post('/accounts/users/register/', data);
    return response.data;
  },
  dashboard: async () => {
    const response = await api.get('/accounts/users/dashboard/');
    return response.data;
  },
};

export const accountsService = {
  getClasses: async () => {
    const response = await api.get('/accounts/classes/');
    return response.data;
  },
  getClass: async (id: number) => {
    const response = await api.get(`/accounts/classes/${id}/`);
    return response.data;
  },
  getSubjects: async () => {
    const response = await api.get('/accounts/subjects/');
    return response.data;
  },
};

export const coursesService = {
  getCourses: async (params?: { subject?: number; classe?: number }) => {
    const response = await api.get('/courses/', { params });
    return response.data;
  },
  getCourse: async (id: number) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },
  enroll: async (id: number) => {
    const response = await api.post(`/courses/${id}/enroll/`);
    return response.data;
  },
  getMyProgress: async (id: number) => {
    const response = await api.get(`/courses/${id}/my_progress/`);
    return response.data;
  },
};

export const assignmentsService = {
  getAssignments: async (params?: { course?: number }) => {
    const response = await api.get('/assignments/', { params });
    return response.data;
  },
  getAssignment: async (id: number) => {
    const response = await api.get(`/assignments/${id}/`);
    return response.data;
  },
  submit: async (id: number, data: { content: string; file?: File }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.file) formData.append('file', data.file);
    const response = await api.post(`/assignments/${id}/submit/`, formData);
    return response.data;
  },
  getQuizzes: async (params?: { course?: number }) => {
    const response = await api.get('/assignments/quizzes/', { params });
    return response.data;
  },
  attemptQuiz: async (id: number, answers: Record<number, string>) => {
    const response = await api.post(`/assignments/quizzes/${id}/attempt/`, { answers });
    return response.data;
  },
};

export const aiService = {
  chat: async (message: string, courseId?: number, sessionId?: number) => {
    const response = await api.post('/ai/chat/chat/', { message, course_id: courseId, session_id: sessionId });
    return response.data;
  },
  getChatHistory: async () => {
    const response = await api.get('/ai/chat/history/');
    return response.data;
  },
  getMyLevel: async (courseId: number) => {
    const response = await api.get('/ai/content/my_level/', { params: { course_id: courseId } });
    return response.data;
  },
  generateContent: async (courseId: number, topic: string) => {
    const response = await api.post('/ai/content/generate_content/', { course_id: courseId, topic });
    return response.data;
  },
  generateQuiz: async (courseId: number, numQuestions?: number) => {
    const response = await api.post('/ai/content/generate_quiz/', { course_id: courseId, num_questions: numQuestions });
    return response.data;
  },
  updateLevel: async (courseId: number, quizScore: number, responseTime: number) => {
    const response = await api.post('/ai/content/update_level/', {
      course_id: courseId,
      quiz_score: quizScore,
      response_time: responseTime,
    });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/ai/analytics/student_analytics/');
    return response.data;
  },
  analyzeDropoutRisk: async (studentId: number) => {
    const response = await api.post('/ai/analytics/analyze_dropout_risk/', { student_id: studentId });
    return response.data;
  },
};

export default api;