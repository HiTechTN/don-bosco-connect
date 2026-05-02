export type UserRole = 'admin' | 'prof' | 'student' | 'parent';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Classe {
  id: number;
  name: string;
  level: string;
  year: string;
  student_count?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface StudentProfile {
  id: number;
  user: User;
  classe: number;
  classe_name?: string;
  xp_points: number;
  level: number;
  badges: string[];
}

export interface TeacherProfile {
  id: number;
  user: User;
  subjects: Subject[];
  classes: Classe[];
}

export interface DashboardData {
  user: User;
  role: UserRole;
  stats?: {
    total_students: number;
    total_profs: number;
    total_classes: number;
    total_subjects: number;
  };
  subjects?: Subject[];
  classes?: Classe[];
  profile?: StudentProfile;
  classe?: Classe;
  children?: User[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  subject: number;
  subject_name: string;
  teacher: number;
  teacher_name: string;
  classe: number;
  classe_name: string;
  thumbnail?: string;
  is_published: boolean;
  lessons_count: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url?: string;
  pdf_file?: string;
  order: number;
  resources?: CourseResource[];
}

export interface CourseResource {
  id: number;
  title: string;
  resource_type: string;
  file?: string;
  url?: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  course: number;
  course_title: string;
  teacher: number;
  teacher_name: string;
  due_date: string;
  max_score: number;
  is_published: boolean;
  submissions_count: number;
}

export interface Quiz {
  id: number;
  title: string;
  course: number;
  course_title: string;
  teacher: number;
  time_limit: number;
  passing_score: number;
  is_published: boolean;
  questions: QuizQuestion[];
  attempts_count: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface LearningPath {
  student: number;
  course: number;
  current_level: number;
  target_level: number;
  recommendations: string[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AnalyticsData {
  completed_lessons?: number;
  average_score?: number;
  quizzes_passed?: number;
  total_courses?: number;
  total_students?: number;
  students_at_risk?: number;
}

export interface DropoutRisk {
  risk_score: number;
  factors: string[];
  recommendations: string[];
}