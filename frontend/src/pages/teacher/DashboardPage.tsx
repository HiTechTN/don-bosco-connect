import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardList, UserCheck, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';

export default function TeacherDashboard() {
  const { data } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => api.get('/analytics/teacher').then(r => r.data),
  });

  const stats = [
    { label: 'Cours', value: data?.total_courses ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    { label: 'Évaluations', value: data?.total_evaluations ?? 0, icon: ClipboardList, color: 'text-purple-600 bg-purple-100' },
    { label: 'Notes (30j)', value: data?.grades_last_30_days ?? 0, icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { label: 'Absences', value: data?.total_absences_recorded ?? 0, icon: UserCheck, color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {data?.average_score && (
        <Card>
          <CardBody>
            <p className="text-lg font-semibold">Moyenne générale des notes</p>
            <p className="text-3xl font-bold text-blue-600">{data.average_score}/20</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}