import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import LoginPage from './pages/auth/LoginPage';
import LandingDemo from './components/LandingDemo';

// Admin
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import ClassesPage from './pages/admin/ClassesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import TimetablePage from './pages/admin/TimetablePage';
import AuditPage from './pages/admin/AuditPage';
import EventsPage from './pages/admin/EventsPage';

// Teacher
import TeacherDashboard from './pages/teacher/DashboardPage';
import TeacherCourses from './pages/teacher/CoursesPage';
import TeacherGrades from './pages/teacher/GradesPage';
import TeacherAbsences from './pages/teacher/AbsencesPage';
import TeacherAI from './pages/teacher/AIChatPage';

// Student
import StudentDashboard from './pages/student/DashboardPage';
import StudentGrades from './pages/student/GradesPage';
import StudentAbsences from './pages/student/AbsencesPage';
import StudentTimetable from './pages/student/TimetablePage';
import StudentQuizzes from './pages/student/QuizzesPage';
import StudentAI from './pages/student/AIChatPage';
import StudentGamification from './pages/student/GamificationPage';

// Parent
import ParentDashboard from './pages/parent/DashboardPage';
import ParentGrades from './pages/parent/GradesPage';
import ParentAbsences from './pages/parent/AbsencesPage';
import ParentMessages from './pages/parent/MessagesPage';

// Teacher messages
import TeacherMessages from './pages/teacher/MessagesPage';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingDemo />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="events" element={<EventsPage />} />
          </Route>
          <Route path="/teacher" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="grades" element={<TeacherGrades />} />
            <Route path="absences" element={<TeacherAbsences />} />
            <Route path="messages" element={<TeacherMessages />} />
            <Route path="ai" element={<TeacherAI />} />
          </Route>
          <Route path="/student" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="absences" element={<StudentAbsences />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="ai" element={<StudentAI />} />
            <Route path="gamification" element={<StudentGamification />} />
          </Route>
          <Route path="/parent" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="grades" element={<ParentGrades />} />
            <Route path="absences" element={<ParentAbsences />} />
            <Route path="messages" element={<ParentMessages />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;