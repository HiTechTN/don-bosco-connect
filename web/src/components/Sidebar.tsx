import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Brain,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const adminLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Élèves' },
    { to: '/admin/professors', icon: GraduationCap, label: 'Professeurs' },
    { to: '/admin/classes', icon: BookOpen, label: 'Classes' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytiques' },
  ];

  const profLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/prof/courses', icon: BookOpen, label: 'Mes Cours' },
    { to: '/prof/assignments', icon: ClipboardList, label: 'Devoirs' },
    { to: '/prof/ai', icon: Brain, label: 'Assistant IA' },
  ];

  const studentLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/student/courses', icon: BookOpen, label: 'Mes Cours' },
    { to: '/student/assignments', icon: ClipboardList, label: 'Devoirs' },
    { to: '/student/ai', icon: Brain, label: 'Mentor IA' },
    { to: '/student/progress', icon: BarChart3, label: 'Progrès' },
  ];

  const parentLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/parent/children', icon: Users, label: 'Mes Enfants' },
    { to: '/parent/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'prof' ? profLinks
    : user?.role === 'student' ? studentLinks
    : parentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Don Bosco</h1>
        <span>Connect</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link to="/settings" className="sidebar-link">
          <Settings size={20} />
          <span>Paramètres</span>
        </Link>
        <button onClick={logout} className="sidebar-link">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}