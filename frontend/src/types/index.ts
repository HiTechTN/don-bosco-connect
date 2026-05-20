export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status?: string;
  phone?: string;
  mfa_enabled?: boolean;
  last_login_at?: string | null;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
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
  subject_name?: string;
  evaluation_title?: string;
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

export interface GradeDistribution {
  min: number;
  max: number;
  count: number;
}

export interface AnalyticsGrades {
  count: number;
  average: number | null;
  max: number | null;
  min: number | null;
  distribution: GradeDistribution[];
}

export interface AnalyticsAIUsage {
  days: number;
  conversations: number;
  user_messages: number;
  avg_tokens_per_response: number;
}

export interface AnalyticsQuizStats {
  total_quizzes: number;
  total_attempts: number;
  average_pass_rate: number;
}

export interface AnalyticsDashboard {
  total_users: number;
  total_teachers: number;
  total_students: number;
  total_parents: number;
  total_courses: number;
  grades_last_30_days: number;
  total_ai_conversations: number;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  academic_year_id: string;
  subject_name: string;
  subject_color: string;
  teacher_name: string;
  created_at: string;
}

export interface GamificationProfile {
  xp_total: number;
  level: number;
  streak_days: number;
  adaptive_level: string;
  avatar_config: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  first_name: string;
  last_name: string;
  xp_total: number;
  level: number;
}

export interface XPHistory {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_email: string;
  created_at: string;
}