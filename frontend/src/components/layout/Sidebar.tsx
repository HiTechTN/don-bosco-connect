import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  GraduationCap, UserCheck, MessageSquare, BrainCircuit, Gamepad2,
  LogOut, ChevronLeft, School, CalendarDays,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const roleNav = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users },
    { to: '/admin/classes', label: 'Classes', icon: GraduationCap },
    { to: '/admin/subjects', label: 'Matières', icon: BookOpen },
    { to: '/admin/timetable', label: 'Emploi du temps', icon: Calendar },
    { to: '/admin/audit', label: 'Audit', icon: ClipboardList },
    { to: '/admin/events', label: 'Événements', icon: CalendarDays },
  ],
  teacher: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/courses', label: 'Mes cours', icon: BookOpen },
    { to: '/teacher/grades', label: 'Notes', icon: ClipboardList },
    { to: '/teacher/absences', label: 'Absences', icon: UserCheck },
    { to: '/teacher/ai', label: 'Assistant IA', icon: BrainCircuit },
    { to: '/teacher/messages', label: 'Messages', icon: MessageSquare },
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/grades', label: 'Mes notes', icon: ClipboardList },
    { to: '/student/absences', label: 'Absences', icon: UserCheck },
    { to: '/student/timetable', label: 'Emploi du temps', icon: Calendar },
    { to: '/student/quizzes', label: 'Quiz', icon: BrainCircuit },
    { to: '/student/ai', label: 'Assistant IA', icon: MessageSquare },
    { to: '/student/gamification', label: 'Gamification', icon: Gamepad2 },
  ],
  parent: [
    { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parent/grades', label: 'Notes', icon: ClipboardList },
    { to: '/parent/absences', label: 'Absences', icon: UserCheck },
    { to: '/parent/messages', label: 'Messages', icon: MessageSquare },
  ],
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;
  const navItems = roleNav[user.role as keyof typeof roleNav] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'h-screen bg-gray-900 text-white flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-700">
        <School className="h-8 w-8 text-blue-400 flex-shrink-0" />
        {!collapsed && <span className="font-bold text-lg truncate">Don Bosco</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-gray-700"
        >
          <ChevronLeft className={clsx('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-gray-700 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-gray-400 truncate">
            {user.first_name} {user.last_name}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}