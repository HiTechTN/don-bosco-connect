import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import './Layout.css';

export function Layout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Topbar />
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}