import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="text-gray-600 mb-4">Bienvenue, {user?.first_name} {user?.last_name}</div>
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Total utilisateurs</div>
            <div className="text-3xl font-bold">{stats.total_users}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Enseignants</div>
            <div className="text-3xl font-bold">{stats.total_teachers}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Élèves</div>
            <div className="text-3xl font-bold">{stats.total_students}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Parents</div>
            <div className="text-3xl font-bold">{stats.total_parents}</div>
          </div>
        </div>
      )}
    </div>
  );
}