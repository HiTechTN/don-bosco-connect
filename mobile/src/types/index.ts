export interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  first_name: string;
  last_name: string;
}

export interface StatCard {
  label: string;
  value: number;
  color?: string;
  icon: string;
}

export interface Grade {
  id: string;
  student_id?: string;
  subject_name: string;
  evaluation_title: string;
  score: number;
  graded_at: string;
  comment?: string;
}

export interface Absence {
  id: string;
  student_id?: string;
  student_name?: string;
  date: string;
  justification_status: 'justified' | 'pending' | 'unjustified';
  type: 'absence' | 'retard';
  subject_name?: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
  subject_color: string;
}

export interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  question_count?: number;
}

export interface Question {
  id: string;
  question_text: string;
  options: { text: string }[];
}

export interface Badge {
  id: string;
  name: string;
  xp_reward: number;
}

export interface LeaderboardEntry {
  rank: number;
  first_name: string;
  last_name: string;
  level: number;
  xp_total: number;
}

export interface XpHistoryEntry {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export type RootStackParamList = {
  Login: undefined;
  AdminHome: undefined;
  AdminUsers: undefined;
  AdminClasses: undefined;
  AdminSubjects: undefined;
  AdminTimetable: undefined;
  AdminEvents: undefined;
  AdminAudit: undefined;
  TeacherHome: undefined;
  TeacherCourses: undefined;
  TeacherGrades: undefined;
  TeacherAbsences: undefined;
  StudentHome: undefined;
  Grades: undefined;
  Absences: undefined;
  StudentTimetable: undefined;
  StudentQuizzes: undefined;
  StudentGamification: undefined;
  ParentHome: undefined;
  ParentGrades: { child: { id: string; first_name: string; last_name: string; email?: string } };
  ParentAbsences: { child: { id: string; first_name: string; last_name: string; email?: string } };
  Messages: undefined;
  AIChat: undefined;
  Profile: undefined;
};

export interface UserRecord {
  id: string;
  email?: string;
  role?: string;
  first_name: string;
  last_name: string;
  status?: string;
  class_id?: string | null;
}

export interface ClassRecord {
  id: string;
  name: string;
  level: number;
  section: string;
  main_teacher_name?: string;
  enrollment_count?: number;
  max_students?: number;
}

export interface SubjectRecord {
  id: string;
  name: string;
  coefficient: number;
  code?: string;
  color?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: string;
  event_type?: string;
  start_datetime?: string;
  all_day?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  user_email: string;
  created_at: string;
  details?: string;
  resource_type?: string;
}

export interface CourseRecord {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  chapter_number?: number;
  is_published?: boolean;
  tags?: string[];
  teacher_id?: string;
  class_id?: string;
}

export interface EvaluationRecord {
  id: string;
  title: string;
  type?: string;
  max_score?: number;
  course_id?: string;
  subject_name?: string;
  date?: string;
  coefficient?: number;
  is_published?: boolean;
}

export interface GradeRecord {
  id: string;
  student_name?: string;
  score?: number;
  max_score?: number;
}

export interface ChildRecord {
  id: string;
  first_name: string;
  last_name: string;
  class_id?: string;
  email?: string;
}
