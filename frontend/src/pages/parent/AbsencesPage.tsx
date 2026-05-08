import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';

export default function ParentAbsences() {
  const { user } = useAuthStore();
  const [selectedStudent] = useState<string | null>(user?.id || null);

  const { data: absences } = useQuery({
    queryKey: ['parent-absences', selectedStudent],
    queryFn: () => api.get(`/students/${selectedStudent}/absences`).then(r => r.data),
    enabled: !!selectedStudent,
  });

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Absences des enfants</h1>
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
        {(!absences || absences.length === 0) && (
          <p className="text-gray-400 text-center py-8">Aucune absence enregistrée</p>
        )}
      </div>
    </div>
  );
}