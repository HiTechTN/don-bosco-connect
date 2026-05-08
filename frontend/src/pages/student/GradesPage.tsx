import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function StudentGrades() {
  const { user } = useAuthStore();
  const { data: grades } = useQuery({
    queryKey: ['my-grades'],
    queryFn: () => api.get(`/students/${user?.id}/grades`).then(r => r.data),
    enabled: !!user?.id,
  });

  const scores = (grades || []).filter((g: any) => g.score != null).map((g: any) => g.score);
  const avg = scores.length ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes notes</h1>
        {avg && <p className="text-lg">Moyenne : <strong className="text-blue-600">{avg}/20</strong></p>}
      </div>
      <div className="space-y-2">
        {grades?.map((g: any) => (
          <Card key={g.id}>
            <CardBody>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-semibold ${g.is_absent ? 'text-red-500' : 'text-gray-900'}`}>
                  {g.is_absent ? 'Absent' : `${g.score}/20`}
                </span>
                {g.comment && <span className="text-sm text-gray-500">{g.comment}</span>}
                {g.graded_at && <span className="text-xs text-gray-400">{new Date(g.graded_at).toLocaleDateString()}</span>}
              </div>
            </CardBody>
          </Card>
        ))}
        {(!grades || grades.length === 0) && (
          <p className="text-gray-400 text-center py-12">Aucune note pour le moment</p>
        )}
      </div>
    </div>
  );
}