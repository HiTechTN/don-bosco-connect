import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function ParentGrades() {
  const { user } = useAuthStore();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // For MVP: show a prompt to select a child (mock single child)
  const { data: grades } = useQuery({
    queryKey: ['parent-grades', selectedStudent],
    queryFn: () => api.get(`/students/${selectedStudent}/grades`).then(r => r.data),
    enabled: !!selectedStudent,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notes des enfants</h1>
      {!selectedStudent ? (
        <Card onClick={() => setSelectedStudent(user?.id || '')}>
          <CardBody>
            <p className="text-gray-500">Sélectionnez un enfant pour voir ses notes</p>
            <p className="text-sm text-blue-600 mt-2">(Fonctionnalité à compléter avec la liste des enfants)</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {grades?.map((g: any) => (
            <Card key={g.id}>
              <CardBody>
                <div className="flex justify-between">
                  <span className="font-semibold">{g.is_absent ? 'Absent' : `${g.score}/20`}</span>
                  {g.comment && <span className="text-sm text-gray-500">{g.comment}</span>}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}