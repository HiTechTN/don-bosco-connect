import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, UserCheck, BrainCircuit, Gamepad2 } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: grades } = useQuery({
    queryKey: ['my-grades'],
    queryFn: () => api.get(`/students/${user?.id}/grades`).then(r => r.data),
    enabled: !!user?.id,
  });

  const { data: absences } = useQuery({
    queryKey: ['my-absences'],
    queryFn: () => api.get(`/students/${user?.id}/absences`).then(r => r.data),
    enabled: !!user?.id,
  });

  const scores = (grades || []).filter((g: any) => g.score != null).map((g: any) => g.score);
  const avg = scores.length ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2) : null;

  const cards = [
    { label: 'Mes notes', value: grades?.length ?? 0, icon: ClipboardList, color: 'text-blue-600 bg-blue-100', path: '/student/grades' },
    { label: 'Absences', value: absences?.length ?? 0, icon: UserCheck, color: 'text-orange-600 bg-orange-100', path: '/student/absences' },
    { label: 'Quiz', value: 'Jouer', icon: BrainCircuit, color: 'text-purple-600 bg-purple-100', path: '/student/quizzes' },
    { label: 'Gamification', value: 'Voir', icon: Gamepad2, color: 'text-green-600 bg-green-100', path: '/student/gamification' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Bonjour, {user?.first_name}
      </h1>
      {avg && <p className="text-lg text-gray-600 mb-6">Moyenne générale : <strong>{avg}/20</strong></p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} onClick={() => navigate(c.path)}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${c.color}`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-sm text-gray-500">{c.label}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}