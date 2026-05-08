export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status?: string;
  phone?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  subject_id?: string;
  class_id?: string;
  teacher_id?: string;
  is_published: boolean;
  created_at: string;
}

export interface Evaluation {
  id: string;
  title: string;
  type: string;
  subject_id?: string;
  class_id?: string;
  teacher_id?: string;
  max_score: number;
  coefficient: number;
  date: string;
  is_published: boolean;
}

export interface Grade {
  id: string;
  evaluation_id: string;
  student_id: string;
  score?: number;
  comment?: string;
  is_absent: boolean;
  graded_at?: string;
}

export interface Absence {
  id: string;
  student_id: string;
  date: string;
  type: string;
  justification_status: string;
  start_time?: string;
  end_time?: string;
}

export interface MessageThread {
  id: string;
  subject?: string;
  last_message?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}