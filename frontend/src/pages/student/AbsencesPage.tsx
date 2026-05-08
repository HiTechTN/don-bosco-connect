import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';

export default function StudentAbsences() {
  const { user } = useAuthStore();
  const { data: absences } = useQuery({
    queryKey: ['my-absences'],
    queryFn: () => api.get(`/students/${user?.id}/absences`).then(r => r.data),
    enabled: !!user?.id,
  });

  const justified = (absences || []).filter((a: any) => a.justification_status === 'justified').length;
  const total = (absences || []).length;

  const statusVariant = (s: string) => {
    if (s === 'justified') return 'success' as const;
    if (s === 'pending') return 'warning' as const;
    return 'danger' as const;
  };
  const statusLabel = (s: string) => {
    if (s === 'justified') return 'Justifiée';
    if (s === 'pending') return 'En attente';
    return 'Non justifiée';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes absences</h1>
      <div className="flex gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 flex-1 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border p-4 flex-1 text-center">
          <p className="text-2xl font-bold text-green-600">{justified}</p>
          <p className="text-sm text-gray-500">Justifiées</p>
        </div>
        <div className="bg-white rounded-xl border p-4 flex-1 text-center">
          <p className="text-2xl font-bold text-red-600">{total - justified}</p>
          <p className="text-sm text-gray-500">Non justifiées</p>
        </div>
      </div>
      <div className="space-y-2">
        {absences?.map((a: any) => (
          <Card key={a.id}>
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="font-medium">{a.date}</span>
                <span className="text-sm text-gray-500">{a.type === 'absence' ? 'Absence' : 'Retard'}</span>
                <Badge variant={statusVariant(a.justification_status)}>{statusLabel(a.justification_status)}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}