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
}

export interface Classe {
  id: number;
  name: string;
  level: string;
  year: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface DashboardData {
  user: User;
  role: UserRole;
  stats?: any;
  subjects?: Subject[];
  classes?: Classe[];
  profile?: any;
  classe?: Classe;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  teacher_name: string;
  thumbnail?: string;
  is_published: boolean;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  course_title: string;
  due_date: string;
}

export interface LearningPath {
  current_level: number;
  target_level: number;
  recommendations: string[];
}