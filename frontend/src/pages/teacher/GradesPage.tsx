import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function TeacherGrades() {
  const [selectedEval, setSelectedEval] = useState<string | null>(null);

  const { data: evaluations } = useQuery({
    queryKey: ['teacher-evaluations'],
    queryFn: () => api.get('/evaluations').then(r => r.data),
  });

  const { data: grades } = useQuery({
    queryKey: ['evaluation-grades', selectedEval],
    queryFn: () => api.get(`/evaluations/${selectedEval}/grades`).then(r => r.data),
    enabled: !!selectedEval,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Évaluations</h1>
        {evaluations?.map((e: any) => (
          <Card
            key={e.id}
            className={`mb-3 ${selectedEval === e.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedEval(e.id)}
          >
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-gray-500">{e.date}</p>
                </div>
                <Badge variant={e.is_published ? 'success' : 'warning'}>
                  {e.is_published ? 'Publié' : 'Brouillon'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
        {grades?.length > 0 ? (
          <div className="space-y-2">
            {grades.map((g: any) => (
              <Card key={g.id}>
                <CardBody>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {g.is_absent ? 'Absent' : `${g.score ?? '-'}/20`}
                    </span>
                    {g.comment && <span className="text-xs text-gray-400">{g.comment}</span>}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : selectedEval ? (
          <p className="text-gray-400 text-center py-8">Aucune note pour cette évaluation</p>
        ) : (
          <p className="text-gray-400 text-center py-8">Sélectionnez une évaluation</p>
        )}
      </div>
    </div>
  );
}