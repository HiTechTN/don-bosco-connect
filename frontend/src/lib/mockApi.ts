interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  phone: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
  name_ar: string;
  code: string;
  color: string;
  coefficient: number;
  description: string;
  created_at: string;
}

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

interface ClassData {
  id: string;
  name: string;
  level: string;
  section: string;
  main_teacher_id: string;
  main_teacher_name: string;
  max_students: number;
  academic_year_id: string;
  enrollment_count: number;
  created_at: string;
}

interface TimetableSlot {
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

interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  enrolled_at: string;
  status: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  created_by: string;
  created_at: string;
}

interface Grade {
  id: string;
  evaluation_id: string;
  student_id: string;
  score: number | null;
  is_absent: boolean;
  comment: string;
  graded_at: string;
  subject_name: string;
  evaluation_title: string;
}

interface Evaluation {
  id: string;
  title: string;
  description: string;
  type: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  max_score: number;
  coefficient: number;
  is_published: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  chapter_number: number;
  tags: string[];
  is_published: boolean;
  created_at: string;
}

interface Absence {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  date: string;
  type: string;
  justification_status: string;
  student_name: string;
}

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_email: string;
  created_at: string;
}

interface ParentChild {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  subject_id: string;
  created_at: string;
}

interface QuizQuestion {
  question_text: string;
  options: Array<{ text: string }>;
}

interface GamificationProfile {
  xp_total: number;
  level: number;
  streak_days: number;
  adaptive_level: string;
  avatar_config: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
}

interface LeaderboardEntry {
  rank: number;
  student_id: string;
  first_name: string;
  last_name: string;
  xp_total: number;
  level: number;
}

interface XPHistoryEntry {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

const DEMO_USERS: User[] = [
  { id: 'admin-uuid-0001', email: 'admin@donbosco.tn', first_name: 'Admin', last_name: 'Principal', role: 'admin', status: 'active', mfa_enabled: false, last_login_at: '2026-05-19T08:00:00Z', phone: '+21650123456', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-19T08:00:00Z' },
  { id: 'teacher-uuid-001', email: 'karim.hamdi@donbosco.tn', first_name: 'Karim', last_name: 'Hamdi', role: 'teacher', status: 'active', mfa_enabled: false, last_login_at: '2026-05-18T09:00:00Z', phone: '+21650123457', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-18T09:00:00Z' },
  { id: 'teacher-uuid-002', email: 'sami.benali@donbosco.tn', first_name: 'Sami', last_name: 'Ben Ali', role: 'teacher', status: 'active', mfa_enabled: false, last_login_at: '2026-05-17T10:00:00Z', phone: '+21650123458', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-17T10:00:00Z' },
  { id: 'teacher-uuid-003', email: 'leila.trabelsi@donbosco.tn', first_name: 'Leila', last_name: 'Trabelsi', role: 'teacher', status: 'active', mfa_enabled: false, last_login_at: '2026-05-16T11:00:00Z', phone: '+21650123459', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-16T11:00:00Z' },
  { id: 'student-uuid-001', email: 'adam.slim@donbosco.tn', first_name: 'Adam', last_name: 'Slim', role: 'student', status: 'active', mfa_enabled: false, last_login_at: '2026-05-19T07:30:00Z', phone: '+21650123460', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-19T07:30:00Z' },
  { id: 'student-uuid-002', email: 'ines.bouzid@donbosco.tn', first_name: 'Inès', last_name: 'Bouzid', role: 'student', status: 'active', mfa_enabled: false, last_login_at: '2026-05-18T08:15:00Z', phone: '+21650123461', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-18T08:15:00Z' },
  { id: 'student-uuid-003', email: 'youssef.mabrouk@donbosco.tn', first_name: 'Youssef', last_name: 'Mabrouk', role: 'student', status: 'active', mfa_enabled: false, last_login_at: '2026-05-17T09:20:00Z', phone: '+21650123462', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-17T09:20:00Z' },
  { id: 'parent-uuid-001', email: 'ahmed.slim@parent.tn', first_name: 'Ahmed', last_name: 'Slim', role: 'parent', status: 'active', mfa_enabled: false, last_login_at: '2026-05-19T06:00:00Z', phone: '+21650123463', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-19T06:00:00Z' },
  { id: 'parent-uuid-002', email: 'fatma.bouzid@parent.tn', first_name: 'Fatma', last_name: 'Bouzid', role: 'parent', status: 'active', mfa_enabled: false, last_login_at: '2026-05-18T07:00:00Z', phone: '+21650123464', preferred_language: 'fr', created_at: '2025-09-01T08:00:00Z', updated_at: '2026-05-18T07:00:00Z' },
];

const SUBJECTS: Subject[] = [
  { id: 'subj-uuid-01', name: 'Mathématiques', name_ar: 'الرياضيات', code: 'MATH', color: '#3B82F6', coefficient: 4, description: 'Mathématiques générales', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-02', name: 'Physique-Chimie', name_ar: 'الفيزياء', code: 'PHY', color: '#10B981', coefficient: 3, description: 'Sciences physiques et chimie', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-03', name: 'Français', name_ar: 'الفرنسية', code: 'FR', color: '#8B5CF6', coefficient: 3, description: 'Langue et littérature françaises', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-04', name: 'Arabe', name_ar: 'العربية', code: 'AR', color: '#F59E0B', coefficient: 3, description: 'Langue et littérature arabes', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-05', name: 'Anglais', name_ar: 'الإنجليزية', code: 'ANG', color: '#EF4444', coefficient: 2, description: 'Langue anglaise', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-06', name: 'Informatique', name_ar: 'الإعلامية', code: 'INFO', color: '#06B6D4', coefficient: 2, description: 'Technologies de l\'information', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-07', name: 'Histoire-Géo', name_ar: 'التاريخ والجغرافيا', code: 'HG', color: '#EC4899', coefficient: 2, description: 'Histoire et géographie', created_at: '2025-09-01T08:00:00Z' },
  { id: 'subj-uuid-08', name: 'Éducation Islamique', name_ar: 'التربية الإسلامية', code: 'EI', color: '#14B8A6', coefficient: 1, description: 'Éducation religieuse', created_at: '2025-09-01T08:00:00Z' },
];

const ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-uuid-001', name: '2025-2026', start_date: '2025-09-01', end_date: '2026-06-30', is_current: true, created_at: '2025-06-01T08:00:00Z' },
  { id: 'ay-uuid-002', name: '2026-2027', start_date: '2026-09-01', end_date: '2027-06-30', is_current: false, created_at: '2026-06-01T08:00:00Z' },
];

const CLASSES: ClassData[] = [
  { id: 'class-uuid-01', name: '6ème A', level: '6ème', section: 'A', main_teacher_id: 'teacher-uuid-001', main_teacher_name: 'Karim Hamdi', max_students: 30, academic_year_id: 'ay-uuid-001', enrollment_count: 28, created_at: '2025-09-01T08:00:00Z' },
  { id: 'class-uuid-02', name: '7ème A', level: '7ème', section: 'A', main_teacher_id: 'teacher-uuid-002', main_teacher_name: 'Sami Ben Ali', max_students: 30, academic_year_id: 'ay-uuid-001', enrollment_count: 25, created_at: '2025-09-01T08:00:00Z' },
  { id: 'class-uuid-03', name: '8ème A', level: '8ème', section: 'A', main_teacher_id: 'teacher-uuid-003', main_teacher_name: 'Leila Trabelsi', max_students: 30, academic_year_id: 'ay-uuid-001', enrollment_count: 27, created_at: '2025-09-01T08:00:00Z' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

function generateTimetable(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  CLASSES.forEach((cls) => {
    DAYS.forEach((day, di) => {
      HOURS.forEach((hour, pi) => {
        const si = (di * HOURS.length + pi) % SUBJECTS.length;
        const ti = si % 3;
        const teacher = DEMO_USERS.filter(u => u.role === 'teacher')[ti];
        slots.push({
          id: `slot-${cls.id}-${day}-${hour.replace(':', '')}`,
          class_id: cls.id,
          subject_id: SUBJECTS[si].id,
          teacher_id: teacher.id,
          day,
          start_time: hour,
          end_time: `${parseInt(hour) + 1}:00`,
          room: `Salle ${101 + pi}`,
          academic_year_id: 'ay-uuid-001',
          subject_name: SUBJECTS[si].name,
          subject_color: SUBJECTS[si].color,
          teacher_name: `${teacher.first_name} ${teacher.last_name}`,
          created_at: '2025-09-01T08:00:00Z',
        });
      });
    });
  });
  return slots;
}

const TIMETABLE = generateTimetable();

const ENROLLMENTS: Enrollment[] = [
  { id: 'enr-uuid-01', student_id: 'student-uuid-001', class_id: 'class-uuid-01', academic_year_id: 'ay-uuid-001', enrolled_at: '2025-09-01T08:00:00Z', status: 'active', student_first_name: 'Adam', student_last_name: 'Slim', student_email: 'adam.slim@donbosco.tn' },
  { id: 'enr-uuid-02', student_id: 'student-uuid-002', class_id: 'class-uuid-02', academic_year_id: 'ay-uuid-001', enrolled_at: '2025-09-01T08:00:00Z', status: 'active', student_first_name: 'Inès', student_last_name: 'Bouzid', student_email: 'ines.bouzid@donbosco.tn' },
  { id: 'enr-uuid-03', student_id: 'student-uuid-003', class_id: 'class-uuid-03', academic_year_id: 'ay-uuid-001', enrolled_at: '2025-09-01T08:00:00Z', status: 'active', student_first_name: 'Youssef', student_last_name: 'Mabrouk', student_email: 'youssef.mabrouk@donbosco.tn' },
];

const EVENTS: Event[] = [
  { id: 'evt-uuid-01', title: 'Rentrée 2026', description: 'Début de l\'année scolaire', event_type: 'academic', start_datetime: '2026-09-01T08:00:00Z', end_datetime: '2026-09-01T12:00:00Z', all_day: false, created_by: 'admin-uuid-0001', created_at: '2026-05-01T08:00:00Z' },
  { id: 'evt-uuid-02', title: 'Vacances d\'automne', description: 'Vacances scolaires d\'automne', event_type: 'holiday', start_datetime: '2026-10-26T00:00:00Z', end_datetime: '2026-11-01T23:59:00Z', all_day: true, created_by: 'admin-uuid-0001', created_at: '2026-05-01T08:00:00Z' },
  { id: 'evt-uuid-03', title: 'Examens 1er Trimestre', description: 'Examens du premier trimestre', event_type: 'exam', start_datetime: '2026-11-15T08:00:00Z', end_datetime: '2026-11-20T16:00:00Z', all_day: false, created_by: 'admin-uuid-0001', created_at: '2026-05-01T08:00:00Z' },
  { id: 'evt-uuid-04', title: 'Fête de fin d\'année', description: 'Cérémonie de remise des diplômes', event_type: 'activity', start_datetime: '2027-06-25T17:00:00Z', end_datetime: '2027-06-25T21:00:00Z', all_day: false, created_by: 'admin-uuid-0001', created_at: '2026-05-01T08:00:00Z' },
  { id: 'evt-uuid-05', title: 'Conseil de classe T1', description: 'Réunion du conseil de classe', event_type: 'academic', start_datetime: '2026-12-10T14:00:00Z', end_datetime: '2026-12-10T17:00:00Z', all_day: false, created_by: 'admin-uuid-0001', created_at: '2026-05-01T08:00:00Z' },
];

const GRADES: Grade[] = [
  { id: 'grd-uuid-01', evaluation_id: 'eval-uuid-01', student_id: 'student-uuid-001', score: 15.5, is_absent: false, comment: 'Bon travail', graded_at: '2026-10-15T10:00:00Z', subject_name: 'Mathématiques', evaluation_title: 'Devoir de maths T1' },
  { id: 'grd-uuid-02', evaluation_id: 'eval-uuid-01', student_id: 'student-uuid-002', score: 12.0, is_absent: false, comment: 'Peut mieux faire', graded_at: '2026-10-15T10:00:00Z', subject_name: 'Mathématiques', evaluation_title: 'Devoir de maths T1' },
  { id: 'grd-uuid-03', evaluation_id: 'eval-uuid-01', student_id: 'student-uuid-003', score: 17.0, is_absent: false, comment: 'Excellent', graded_at: '2026-10-15T10:00:00Z', subject_name: 'Mathématiques', evaluation_title: 'Devoir de maths T1' },
  { id: 'grd-uuid-04', evaluation_id: 'eval-uuid-02', student_id: 'student-uuid-001', score: 14.0, is_absent: false, comment: 'Bien', graded_at: '2026-11-01T10:00:00Z', subject_name: 'Français', evaluation_title: 'Composition française' },
  { id: 'grd-uuid-05', evaluation_id: 'eval-uuid-02', student_id: 'student-uuid-002', score: 8.5, is_absent: false, comment: 'À revoir', graded_at: '2026-11-01T10:00:00Z', subject_name: 'Français', evaluation_title: 'Composition française' },
  { id: 'grd-uuid-06', evaluation_id: 'eval-uuid-02', student_id: 'student-uuid-003', score: 16.5, is_absent: false, comment: 'Très bien', graded_at: '2026-11-01T10:00:00Z', subject_name: 'Français', evaluation_title: 'Composition française' },
  { id: 'grd-uuid-07', evaluation_id: 'eval-uuid-03', student_id: 'student-uuid-001', score: 13.0, is_absent: false, comment: 'Correct', graded_at: '2026-11-20T10:00:00Z', subject_name: 'Anglais', evaluation_title: 'Test d\'anglais' },
  { id: 'grd-uuid-08', evaluation_id: 'eval-uuid-03', student_id: 'student-uuid-002', score: 10.0, is_absent: false, comment: 'Passable', graded_at: '2026-11-20T10:00:00Z', subject_name: 'Anglais', evaluation_title: 'Test d\'anglais' },
  { id: 'grd-uuid-09', evaluation_id: 'eval-uuid-03', student_id: 'student-uuid-003', score: 18.0, is_absent: false, comment: 'Excellent', graded_at: '2026-11-20T10:00:00Z', subject_name: 'Anglais', evaluation_title: 'Test d\'anglais' },
  { id: 'grd-uuid-10', evaluation_id: 'eval-uuid-04', student_id: 'student-uuid-001', score: null, is_absent: true, comment: 'Absent non justifié', graded_at: '2026-12-01T10:00:00Z', subject_name: 'Physique-Chimie', evaluation_title: 'Devoir de physique' },
];

const EVALUATIONS: Evaluation[] = [
  { id: 'eval-uuid-01', title: 'Devoir de maths T1', description: 'Devoir surveillé', type: 'devoir', subject_id: 'subj-uuid-01', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-001', max_score: 20, coefficient: 1, is_published: true, created_at: '2026-10-01T08:00:00Z' },
  { id: 'eval-uuid-02', title: 'Composition française', description: 'Rédaction', type: 'examen', subject_id: 'subj-uuid-03', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-002', max_score: 20, coefficient: 2, is_published: true, created_at: '2026-10-15T08:00:00Z' },
  { id: 'eval-uuid-03', title: 'Test d\'anglais', description: 'Compréhension écrite', type: 'controle', subject_id: 'subj-uuid-05', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-003', max_score: 20, coefficient: 1, is_published: true, created_at: '2026-11-01T08:00:00Z' },
  { id: 'eval-uuid-04', title: 'Devoir de physique', description: 'Électricité', type: 'devoir', subject_id: 'subj-uuid-02', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-001', max_score: 20, coefficient: 1, is_published: true, created_at: '2026-11-15T08:00:00Z' },
  { id: 'eval-uuid-05', title: 'Interrogation arabe', description: 'Grammaire', type: 'controle', subject_id: 'subj-uuid-04', class_id: 'class-uuid-02', teacher_id: 'teacher-uuid-002', max_score: 20, coefficient: 1, is_published: false, created_at: '2026-11-20T08:00:00Z' },
];

const COURSES: Course[] = [
  { id: 'crs-uuid-01', title: 'Introduction aux équations', description: 'Résolution d\'équations du premier degré', subject_id: 'subj-uuid-01', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-001', chapter_number: 3, tags: ['algèbre', 'équations'], is_published: true, created_at: '2026-09-15T08:00:00Z' },
  { id: 'crs-uuid-02', title: 'La conjugaison française', description: 'Les temps verbaux', subject_id: 'subj-uuid-03', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-002', chapter_number: 2, tags: ['grammaire', 'conjugaison'], is_published: true, created_at: '2026-09-20T08:00:00Z' },
  { id: 'crs-uuid-03', title: 'Electricité statique', description: 'Les charges électriques', subject_id: 'subj-uuid-02', class_id: 'class-uuid-01', teacher_id: 'teacher-uuid-003', chapter_number: 4, tags: ['physique', 'électricité'], is_published: false, created_at: '2026-10-01T08:00:00Z' },
  { id: 'crs-uuid-04', title: 'Algorithmes de base', description: 'Introduction à l\'algorithmique', subject_id: 'subj-uuid-06', class_id: 'class-uuid-02', teacher_id: 'teacher-uuid-001', chapter_number: 1, tags: ['informatique', 'algorithmes'], is_published: true, created_at: '2026-09-10T08:00:00Z' },
  { id: 'crs-uuid-05', title: 'Civilisation arabo-islamique', description: 'L\'âge d\'or islamique', subject_id: 'subj-uuid-08', class_id: 'class-uuid-02', teacher_id: 'teacher-uuid-002', chapter_number: 2, tags: ['histoire', 'civilisation'], is_published: true, created_at: '2026-09-25T08:00:00Z' },
];

const ABSENCES: Absence[] = [
  { id: 'abs-uuid-01', student_id: 'student-uuid-001', class_id: 'class-uuid-01', subject_id: 'subj-uuid-02', teacher_id: 'teacher-uuid-003', date: '2026-10-20', type: 'absence', justification_status: 'justified', student_name: 'Adam Slim' },
  { id: 'abs-uuid-02', student_id: 'student-uuid-002', class_id: 'class-uuid-02', subject_id: 'subj-uuid-03', teacher_id: 'teacher-uuid-002', date: '2026-10-22', type: 'absence', justification_status: 'pending', student_name: 'Inès Bouzid' },
  { id: 'abs-uuid-03', student_id: 'student-uuid-001', class_id: 'class-uuid-01', subject_id: 'subj-uuid-05', teacher_id: 'teacher-uuid-001', date: '2026-11-05', type: 'retard', justification_status: 'unjustified', student_name: 'Adam Slim' },
  { id: 'abs-uuid-04', student_id: 'student-uuid-003', class_id: 'class-uuid-03', subject_id: 'subj-uuid-01', teacher_id: 'teacher-uuid-001', date: '2026-11-10', type: 'absence', justification_status: 'justified', student_name: 'Youssef Mabrouk' },
  { id: 'abs-uuid-05', student_id: 'student-uuid-002', class_id: 'class-uuid-02', subject_id: 'subj-uuid-04', teacher_id: 'teacher-uuid-002', date: '2026-11-15', type: 'absence', justification_status: 'pending', student_name: 'Inès Bouzid' },
  { id: 'abs-uuid-06', student_id: 'student-uuid-001', class_id: 'class-uuid-01', subject_id: 'subj-uuid-04', teacher_id: 'teacher-uuid-002', date: '2026-11-18', type: 'absence', justification_status: 'unjustified', student_name: 'Adam Slim' },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: 1, user_id: 'admin-uuid-0001', action: 'user.login', resource_type: 'user', resource_id: null, user_email: 'admin@donbosco.tn', created_at: '2026-05-19T08:00:00Z' },
  { id: 2, user_id: 'admin-uuid-0001', action: 'user.create', resource_type: 'user', resource_id: 'student-uuid-003', user_email: 'admin@donbosco.tn', created_at: '2026-05-18T09:00:00Z' },
  { id: 3, user_id: 'admin-uuid-0001', action: 'class.create', resource_type: 'class', resource_id: 'class-uuid-03', user_email: 'admin@donbosco.tn', created_at: '2026-05-17T10:00:00Z' },
  { id: 4, user_id: 'admin-uuid-0001', action: 'subject.create', resource_type: 'subject', resource_id: 'subj-uuid-06', user_email: 'admin@donbosco.tn', created_at: '2026-05-16T11:00:00Z' },
  { id: 5, user_id: 'admin-uuid-0001', action: 'enrollment.create', resource_type: 'enrollment', resource_id: 'enr-uuid-03', user_email: 'admin@donbosco.tn', created_at: '2026-05-15T12:00:00Z' },
  { id: 6, user_id: 'teacher-uuid-001', action: 'user.login', resource_type: 'user', resource_id: null, user_email: 'karim.hamdi@donbosco.tn', created_at: '2026-05-19T09:00:00Z' },
  { id: 7, user_id: 'teacher-uuid-001', action: 'course.create', resource_type: 'course', resource_id: 'crs-uuid-01', user_email: 'karim.hamdi@donbosco.tn', created_at: '2026-05-14T10:00:00Z' },
  { id: 8, user_id: 'admin-uuid-0001', action: 'event.create', resource_type: 'event', resource_id: 'evt-uuid-03', user_email: 'admin@donbosco.tn', created_at: '2026-05-13T08:00:00Z' },
  { id: 9, user_id: 'student-uuid-001', action: 'user.login', resource_type: 'user', resource_id: null, user_email: 'adam.slim@donbosco.tn', created_at: '2026-05-19T07:30:00Z' },
  { id: 10, user_id: 'parent-uuid-001', action: 'user.login', resource_type: 'user', resource_id: null, user_email: 'ahmed.slim@parent.tn', created_at: '2026-05-19T06:00:00Z' },
];

const PARENT_CHILDREN: Record<string, ParentChild[]> = {
  'parent-uuid-001': [{ id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim', email: 'adam.slim@donbosco.tn' }],
  'parent-uuid-002': [{ id: 'student-uuid-002', first_name: 'Inès', last_name: 'Bouzid', email: 'ines.bouzid@donbosco.tn' }],
};

const QUIZZES: Quiz[] = [
  { id: 'quiz-uuid-01', title: 'Quiz Mathématiques - Équations', difficulty: 'Moyen', subject_id: 'subj-uuid-01', created_at: '2026-10-01T08:00:00Z' },
  { id: 'quiz-uuid-02', title: 'Quiz Français - Conjugaison', difficulty: 'Facile', subject_id: 'subj-uuid-03', created_at: '2026-10-15T08:00:00Z' },
  { id: 'quiz-uuid-03', title: 'Quiz Anglais - Vocabulary', difficulty: 'Difficile', subject_id: 'subj-uuid-05', created_at: '2026-11-01T08:00:00Z' },
];

const QUIZ_QUESTIONS: Record<string, { options: QuizQuestion[] }> = {
  'quiz-uuid-01': {
    options: [
      { question_text: 'Résoudre: 2x + 3 = 7', options: [{ text: 'x = 1' }, { text: 'x = 2' }, { text: 'x = 3' }, { text: 'x = 4' }] },
      { question_text: 'Résoudre: 3x - 5 = 10', options: [{ text: 'x = 3' }, { text: 'x = 5' }, { text: 'x = 7' }, { text: 'x = 10' }] },
      { question_text: 'Résoudre: -2x + 4 = 0', options: [{ text: 'x = -2' }, { text: 'x = 0' }, { text: 'x = 2' }, { text: 'x = 4' }] },
      { question_text: 'Résoudre: 5x + 2 = 3x + 8', options: [{ text: 'x = 1' }, { text: 'x = 2' }, { text: 'x = 3' }, { text: 'x = 4' }] },
    ],
  },
};

const GAMIFICATION_PROFILE: GamificationProfile = {
  xp_total: 2450,
  level: 5,
  streak_days: 7,
  adaptive_level: 'normal',
  avatar_config: null,
};

const BADGES: Badge[] = [
  { id: 'bdg-uuid-01', name: 'Premier Quiz', description: 'Complète ton premier quiz', xp_reward: 100 },
  { id: 'bdg-uuid-02', name: 'Score Parfait', description: 'Obtiens 20/20 à un quiz', xp_reward: 250 },
  { id: 'bdg-uuid-03', name: 'Série de 7 jours', description: 'Maintiens une série de 7 jours', xp_reward: 200 },
  { id: 'bdg-uuid-04', name: 'Étudiant du mois', description: 'Sois le meilleur étudiant du mois', xp_reward: 500 },
  { id: 'bdg-uuid-05', name: 'Série de 30 jours', description: 'Maintiens une série de 30 jours', xp_reward: 1000 },
  { id: 'bdg-uuid-06', name: 'Assistant', description: 'Aide un camarade', xp_reward: 150 },
  { id: 'bdg-uuid-07', name: 'Érudit', description: 'Termine 10 cours', xp_reward: 300 },
  { id: 'bdg-uuid-08', name: 'Diplômé', description: 'Termine tous les cours d\'une matière', xp_reward: 400 },
  { id: 'bdg-uuid-09', name: 'Étoile Montante', description: 'Gagne 1000 XP', xp_reward: 200 },
  { id: 'bdg-uuid-10', name: 'Champion', description: 'Sois numéro 1 au classement', xp_reward: 750 },
];

const MY_BADGES = BADGES.slice(0, 4);

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, student_id: 'student-uuid-003', first_name: 'Youssef', last_name: 'Mabrouk', xp_total: 3200, level: 6 },
  { rank: 2, student_id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim', xp_total: 2450, level: 5 },
  { rank: 3, student_id: 'student-uuid-002', first_name: 'Inès', last_name: 'Bouzid', xp_total: 1800, level: 4 },
];

const XP_HISTORY: XPHistoryEntry[] = [
  { id: 'xp-01', amount: 50, reason: 'Quiz complété', created_at: '2026-05-19T08:00:00Z' },
  { id: 'xp-02', amount: 100, reason: 'Badge débloqué: Premier Quiz', created_at: '2026-05-18T09:00:00Z' },
  { id: 'xp-03', amount: 30, reason: 'Connexion quotidienne', created_at: '2026-05-17T10:00:00Z' },
  { id: 'xp-04', amount: 200, reason: 'Badge débloqué: Score Parfait', created_at: '2026-05-16T11:00:00Z' },
  { id: 'xp-05', amount: 50, reason: 'Cours consulté', created_at: '2026-05-15T12:00:00Z' },
];

function findUser(email: string): User | undefined {
  return DEMO_USERS.find(u => u.email === email);
}

function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);
  return { items: paged, total, page, per_page: perPage, pages };
}

function createTokenResponse(user: User) {
  return {
    access_token: `mock_${user.role}_${user.id}_${Date.now()}`,
    refresh_token: `mock_refresh_${user.id}_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
  };
}

interface MockRequest {
  method: string;
  url: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

function extractToken(req: MockRequest): string {
  const sessionToken = sessionStorage.getItem('access_token');
  if (sessionToken) return sessionToken;
  const authHeader = req.headers?.Authorization || req.headers?.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

export function handleMockRequest(req: MockRequest) {
  const { method, url, data, params } = req;
  const path = url.replace(/^\/api\/v1/, '');
  const token = extractToken(req);
  const currentUser = token ? DEMO_USERS.find(u => token.includes(u.id)) || DEMO_USERS[0] : null;

  if (path === '/auth/login' && method === 'POST') {
    const user = findUser(data?.email as string);
    if (user) return { data: createTokenResponse(user), status: 200 };
    return { data: { detail: 'Email ou mot de passe incorrect' }, status: 401 };
  }
  if (path === '/auth/refresh' && method === 'POST') {
    const user = currentUser || DEMO_USERS[0];
    return { data: createTokenResponse(user), status: 200 };
  }

  if (!currentUser && path !== '/auth/login') {
    return { data: { detail: 'Not authenticated' }, status: 401 };
  }

  if (path === '/users' && method === 'GET') {
    let filtered = [...DEMO_USERS];
    const role = params?.role;
    const search = params?.search;
    if (role) filtered = filtered.filter(u => u.role === role);
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = filtered.filter(u => u.first_name.toLowerCase().includes(s) || u.last_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return { data: paginate(filtered, (params?.page as number) || 1, (params?.per_page as number) || 20), status: 200 };
  }
  if (path === '/users' && method === 'POST') {
    const newUser = { id: `user-${Date.now()}`, ...data, status: 'active', mfa_enabled: false, last_login_at: null, phone: null, preferred_language: 'fr', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    DEMO_USERS.push(newUser as User);
    return { data: newUser, status: 201 };
  }
  if (path.match(/^\/users\/me\/children$/) && method === 'GET') {
    const children = PARENT_CHILDREN[currentUser!.id] || [];
    return { data: children, status: 200 };
  }
  if (path === '/users/me' && method === 'GET') {
    return { data: currentUser, status: 200 };
  }
  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const uid = userMatch[1];
    if (method === 'GET') {
      const user = DEMO_USERS.find(u => u.id === uid);
      return user ? { data: user, status: 200 } : { data: { detail: 'Not found' }, status: 404 };
    }
    if (method === 'PATCH') {
      const idx = DEMO_USERS.findIndex(u => u.id === uid);
      if (idx >= 0) { DEMO_USERS[idx] = { ...DEMO_USERS[idx], ...data }; return { data: DEMO_USERS[idx], status: 200 }; }
      return { data: { detail: 'Not found' }, status: 404 };
    }
    if (method === 'DELETE') {
      const idx = DEMO_USERS.findIndex(u => u.id === uid);
      if (idx >= 0) { DEMO_USERS[idx].status = 'inactive'; return { data: { message: 'Utilisateur désactivé' }, status: 200 }; }
      return { data: { detail: 'Not found' }, status: 404 };
    }
  }

  if (path === '/classes' && method === 'GET') return { data: CLASSES, status: 200 };
  if (path === '/classes' && method === 'POST') {
    const teacher = DEMO_USERS.find(u => u.id === (data as Record<string, unknown>)?.main_teacher_id);
    const newClass = { id: `class-${Date.now()}`, ...data, enrollment_count: 0, main_teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : '', created_at: new Date().toISOString() };
    CLASSES.push(newClass as ClassData);
    return { data: newClass, status: 201 };
  }
  const classMatch = path.match(/^\/classes\/([^/]+)$/);
  if (classMatch) {
    const cid = classMatch[1];
    if (method === 'PATCH') {
      const idx = CLASSES.findIndex(c => c.id === cid);
      if (idx >= 0) { CLASSES[idx] = { ...CLASSES[idx], ...data }; return { data: CLASSES[idx], status: 200 }; }
      return { data: { detail: 'Not found' }, status: 404 };
    }
    if (method === 'DELETE') {
      const idx = CLASSES.findIndex(c => c.id === cid);
      if (idx >= 0) { CLASSES.splice(idx, 1); return { data: null, status: 204 }; }
      return { data: { detail: 'Not found' }, status: 404 };
    }
  }
  const studentsMatch = path.match(/^\/classes\/([^/]+)\/students$/);
  if (studentsMatch) {
    const cid = studentsMatch[1];
    if (method === 'GET') return { data: ENROLLMENTS.filter(e => e.class_id === cid), status: 200 };
    if (method === 'POST') {
      const newEnr = { id: `enr-${Date.now()}`, student_id: (data as Record<string, unknown>)?.student_id, class_id: cid, academic_year_id: (data as Record<string, unknown>)?.academic_year_id, enrolled_at: new Date().toISOString(), status: 'active', student_first_name: '', student_last_name: '', student_email: '' };
      ENROLLMENTS.push(newEnr as Enrollment);
      return { data: newEnr, status: 201 };
    }
  }
  if (path.match(/^\/classes\/enrollments\/([^/]+)$/) && method === 'DELETE') {
    return { data: null, status: 204 };
  }

  if (path === '/subjects' && method === 'GET') return { data: paginate(SUBJECTS, 1, 50), status: 200 };
  if (path === '/subjects' && method === 'POST') {
    const newSubj = { id: `subj-${Date.now()}`, ...data, created_at: new Date().toISOString() };
    SUBJECTS.push(newSubj as Subject);
    return { data: newSubj, status: 201 };
  }
  const subjMatch = path.match(/^\/subjects\/([^/]+)$/);
  if (subjMatch) {
    const sid = subjMatch[1];
    const idx = SUBJECTS.findIndex(s => s.id === sid);
    if (method === 'PATCH' && idx >= 0) { SUBJECTS[idx] = { ...SUBJECTS[idx], ...data }; return { data: SUBJECTS[idx], status: 200 }; }
    if (method === 'DELETE' && idx >= 0) { SUBJECTS.splice(idx, 1); return { data: null, status: 204 }; }
    return { data: { detail: 'Not found' }, status: 404 };
  }

  if (path === '/academic-years' && method === 'GET') return { data: ACADEMIC_YEARS, status: 200 };

  if (path === '/timetable' && method === 'GET') {
    const classId = params?.class_id;
    const slots = classId ? TIMETABLE.filter(s => s.class_id === classId) : TIMETABLE;
    return { data: slots, status: 200 };
  }
  if (path === '/timetable/my' && method === 'GET') {
    const role = currentUser?.role;
    let classId: string | null = null;
    if (role === 'student') {
      const enr = ENROLLMENTS.find(e => e.student_id === currentUser!.id);
      if (enr) classId = enr.class_id;
    } else if (role === 'teacher') {
      const cls = CLASSES.find(c => c.main_teacher_id === currentUser!.id);
      if (cls) classId = cls.id;
    }
    if (!classId) return { data: [], status: 200 };
    return { data: TIMETABLE.filter(s => s.class_id === classId), status: 200 };
  }
  if (path === '/timetable/slots' && method === 'POST') {
    const slot = { id: `slot-${Date.now()}`, ...data, created_at: new Date().toISOString(), subject_name: SUBJECTS.find(s => s.id === (data as Record<string, unknown>)?.subject_id)?.name, teacher_name: DEMO_USERS.find(u => u.id === (data as Record<string, unknown>)?.teacher_id)?.first_name + ' ' + DEMO_USERS.find(u => u.id === (data as Record<string, unknown>)?.teacher_id)?.last_name };
    TIMETABLE.push(slot as TimetableSlot);
    return { data: slot, status: 201 };
  }
  if (path.match(/^\/timetable\/slots\/([^/]+)$/) && method === 'DELETE') return { data: null, status: 204 };

  if (path === '/courses' && method === 'GET') return { data: COURSES, status: 200 };
  if (path === '/courses' && method === 'POST') {
    const crs = { id: `crs-${Date.now()}`, ...data, is_published: false, created_at: new Date().toISOString() };
    COURSES.push(crs as Course);
    return { data: crs, status: 201 };
  }
  const crsMatch = path.match(/^\/courses\/([^/]+)$/);
  if (crsMatch) {
    const cid = crsMatch[1];
    const idx = COURSES.findIndex(c => c.id === cid);
    if (method === 'PATCH' && idx >= 0) { COURSES[idx] = { ...COURSES[idx], ...data }; return { data: COURSES[idx], status: 200 }; }
    if (method === 'DELETE' && idx >= 0) { COURSES.splice(idx, 1); return { data: null, status: 204 }; }
    return { data: { detail: 'Not found' }, status: 404 };
  }

  if (path === '/evaluations' && method === 'GET') return { data: EVALUATIONS, status: 200 };
  if (path === '/evaluations' && method === 'POST') {
    const ev = { id: `eval-${Date.now()}`, ...data, is_published: false, created_at: new Date().toISOString() };
    EVALUATIONS.push(ev as Evaluation);
    return { data: ev, status: 201 };
  }
  const evalMatch = path.match(/^\/evaluations\/([^/]+)$/);
  if (evalMatch) {
    const eid = evalMatch[1];
    const idx = EVALUATIONS.findIndex(e => e.id === eid);
    if (method === 'PATCH' && idx >= 0) { EVALUATIONS[idx] = { ...EVALUATIONS[idx], ...data }; return { data: EVALUATIONS[idx], status: 200 }; }
  }
  const evalGradesMatch = path.match(/^\/evaluations\/([^/]+)\/grades$/);
  if (evalGradesMatch && method === 'GET') {
    const eid = evalGradesMatch[1];
    return { data: GRADES.filter(g => g.evaluation_id === eid), status: 200 };
  }

  if (path === '/events' && method === 'GET') return { data: paginate(EVENTS, (params?.page as number) || 1, (params?.per_page as number) || 50), status: 200 };
  if (path === '/events' && method === 'POST') {
    const ev = { id: `evt-${Date.now()}`, ...data, created_by: currentUser!.id, created_at: new Date().toISOString() };
    EVENTS.push(ev as Event);
    return { data: ev, status: 201 };
  }
  const evtMatch = path.match(/^\/events\/([^/]+)$/);
  if (evtMatch) {
    const eid = evtMatch[1];
    const idx = EVENTS.findIndex(e => e.id === eid);
    if (method === 'PATCH' && idx >= 0) { EVENTS[idx] = { ...EVENTS[idx], ...data }; return { data: EVENTS[idx], status: 200 }; }
    if (method === 'DELETE' && idx >= 0) { EVENTS.splice(idx, 1); return { data: null, status: 204 }; }
    return { data: { detail: 'Not found' }, status: 404 };
  }

  if (path === '/absences' && method === 'GET') return { data: ABSENCES, status: 200 };
  if (path === '/absences' && method === 'POST') {
    const student = DEMO_USERS.find(u => u.id === (data as Record<string, unknown>)?.student_id);
    const abs = { id: `abs-${Date.now()}`, ...data, justification_status: 'pending', student_name: student ? `${student.first_name} ${student.last_name}` : '' };
    ABSENCES.push(abs as Absence);
    return { data: abs, status: 201 };
  }
  const absMatch = path.match(/^\/absences\/([^/]+)$/);
  if (absMatch && method === 'PATCH') {
    const aid = absMatch[1];
    const idx = ABSENCES.findIndex(a => a.id === aid);
    if (idx >= 0) { ABSENCES[idx] = { ...ABSENCES[idx], ...data }; return { data: ABSENCES[idx], status: 200 }; }
    return { data: { detail: 'Not found' }, status: 404 };
  }

  const studentGradesMatch = path.match(/^\/students\/([^/]+)\/grades$/);
  if (studentGradesMatch && method === 'GET') {
    const sid = studentGradesMatch[1];
    return { data: GRADES.filter(g => g.student_id === sid), status: 200 };
  }
  const studentAbsencesMatch = path.match(/^\/students\/([^/]+)\/absences$/);
  if (studentAbsencesMatch && method === 'GET') {
    const sid = studentAbsencesMatch[1];
    let result = ABSENCES.filter(a => a.student_id === sid);
    if (params?.from_date) result = result.filter(a => a.date >= (params.from_date as string));
    return { data: result, status: 200 };
  }

  if (path === '/analytics/dashboard' && method === 'GET') {
    return { data: { total_users: DEMO_USERS.length, total_teachers: DEMO_USERS.filter(u => u.role === 'teacher').length, total_students: DEMO_USERS.filter(u => u.role === 'student').length, total_parents: DEMO_USERS.filter(u => u.role === 'parent').length, total_courses: COURSES.length, grades_last_30_days: GRADES.length, total_ai_conversations: 42 }, status: 200 };
  }
  if (path === '/analytics/teacher' && method === 'GET') {
    const tCourses = COURSES.filter(c => c.teacher_id === currentUser?.id).length;
    const tEvals = EVALUATIONS.filter(e => e.teacher_id === currentUser?.id).length;
    const tGrades = GRADES.filter(g => EVALUATIONS.some(e => e.id === g.evaluation_id && e.teacher_id === currentUser?.id)).length;
    const scores = GRADES.filter(g => g.score != null).map(g => g.score);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { data: { total_courses: tCourses, total_evaluations: tEvals, grades_last_30_days: tGrades, average_score: avg ? parseFloat(avg.toFixed(2)) : null, total_absences_recorded: ABSENCES.length }, status: 200 };
  }
  if (path === '/analytics/grades' && method === 'GET') {
    const scores = GRADES.filter(g => g.score != null).map(g => g.score as number);
    const bins = [
      { min: 0, max: 5, count: scores.filter(s => s < 5).length },
      { min: 5, max: 10, count: scores.filter(s => s >= 5 && s < 10).length },
      { min: 10, max: 12, count: scores.filter(s => s >= 10 && s < 12).length },
      { min: 12, max: 15, count: scores.filter(s => s >= 12 && s < 15).length },
      { min: 15, max: 18, count: scores.filter(s => s >= 15 && s < 18).length },
      { min: 18, max: 21, count: scores.filter(s => s >= 18).length },
    ];
    const avg = scores.length ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : null;
    const max = scores.length ? Math.max(...scores) : null;
    const min = scores.length ? Math.min(...scores) : null;
    return { data: { count: scores.length, average: avg, max, min, distribution: bins }, status: 200 };
  }
  if (path === '/analytics/ai-usage' && method === 'GET') {
    return { data: { days: params?.days || 30, conversations: 42, user_messages: 156, avg_tokens_per_response: 245.3 }, status: 200 };
  }
  if (path === '/analytics/quiz-stats' && method === 'GET') {
    return { data: { total_quizzes: QUIZZES.length, total_attempts: 18, average_pass_rate: 72.5 }, status: 200 };
  }

  if (path === '/audit/logs' && method === 'GET') {
    let filtered = [...AUDIT_LOGS];
    if (params?.resource_type) filtered = filtered.filter(l => l.resource_type === params.resource_type);
    return { data: paginate(filtered, (params?.page as number) || 1, (params?.per_page as number) || 50), status: 200 };
  }

  if (path === '/gamification/profile' && method === 'GET') return { data: GAMIFICATION_PROFILE, status: 200 };
  if (path === '/gamification/my-badges' && method === 'GET') return { data: MY_BADGES, status: 200 };
  if (path === '/gamification/badges' && method === 'GET') return { data: BADGES, status: 200 };
  if (path === '/gamification/leaderboard' && method === 'GET') return { data: LEADERBOARD, status: 200 };
  if (path === '/gamification/xp-history' && method === 'GET') return { data: XP_HISTORY, status: 200 };

  if (path === '/ai/quizzes' && method === 'GET') return { data: QUIZZES, status: 200 };
  const quizDetailMatch = path.match(/^\/ai\/quizzes\/([^/]+)$/);
  if (quizDetailMatch && method === 'GET') {
    const qid = quizDetailMatch[1];
    return { data: QUIZ_QUESTIONS[qid] || { options: [] }, status: 200 };
  }
  const quizAttemptMatch = path.match(/^\/ai\/quizzes\/([^/]+)\/attempt$/);
  if (quizAttemptMatch && method === 'POST') {
    return { data: { score: Math.floor(Math.random() * 16) + 4, max_score: 20, total_questions: 4, correct_answers: Math.floor(Math.random() * 3) + 2 }, status: 200 };
  }

  if (path === '/ai/conversations' && method === 'POST') {
    return { data: { id: `conv-${Date.now()}`, title: 'Chat IA', messages: [] }, status: 201 };
  }

  if (path === '/messages/threads' && method === 'GET') {
    return { data: [{ id: 'thread-01', participants: [{ id: 'teacher-uuid-001', first_name: 'Karim', last_name: 'Hamdi' }, { id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim' }], last_message: { content: 'Bonjour, avez-vous vu mon devoir ?', created_at: '2026-05-19T08:00:00Z' }, unread_count: 0 }], status: 200 };
  }
  const threadMsgMatch = path.match(/^\/messages\/threads\/([^/]+)$/);
  if (threadMsgMatch && method === 'GET') {
    return { data: [{ id: 'msg-01', sender_id: 'student-uuid-001', content: 'Bonjour, avez-vous vu mon devoir ?', created_at: '2026-05-19T08:00:00Z' }, { id: 'msg-02', sender_id: 'teacher-uuid-001', content: 'Oui, je l\'ai corrigé. Bon travail!', created_at: '2026-05-19T09:00:00Z' }], status: 200 };
  }
  if (threadMsgMatch && method === 'POST') {
    return { data: { id: `msg-${Date.now()}`, sender_id: currentUser!.id, content: (data as Record<string, unknown>)?.content, created_at: new Date().toISOString() }, status: 201 };
  }

  return { data: { detail: 'Not found' }, status: 404 };
}

export function isGitHubPages() {
  return window.location.hostname.includes('github.io') || window.location.hostname.includes('githubusercontent.com');
}