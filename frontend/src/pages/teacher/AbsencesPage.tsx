import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function TeacherAbsences() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', date: '', type: 'absence', class_id: '' });

  const { data: absences } = useQuery({
    queryKey: ['absences'],
    queryFn: () => api.get('/absences').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/absences', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      setShowModal(false);
    },
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absences</h1>
        <Button onClick={() => setShowModal(true)}>Signaler une absence</Button>
      </div>
      <div className="space-y-3">
        {absences?.map((a: any) => (
          <Card key={a.id}>
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{a.date}</p>
                  <p className="text-sm text-gray-500">
                    {a.type === 'absence' ? 'Absence' : 'Retard'}
                    {a.subject_id && ` • ${a.subject_id}`}
                  </p>
                </div>
                <Badge variant={statusVariant(a.justification_status)}>
                  {statusLabel(a.justification_status)}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Signaler une absence">
        <div className="space-y-4">
          <input
            placeholder="Date (YYYY-MM-DD)"
            className="w-full border rounded-lg px-3 py-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="absence">Absence</option>
            <option value="retard">Retard</option>
          </select>
          <Button className="w-full" onClick={() => createMutation.mutate(form)} loading={createMutation.isPending}>
            Enregistrer
          </Button>
        </div>
      </Modal>
    </div>
  );
}