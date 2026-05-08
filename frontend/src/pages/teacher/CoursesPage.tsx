import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export default function TeacherCourses() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', class_id: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/subjects').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/courses', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      setShowModal(false);
      setForm({ title: '', description: '', subject_id: '', class_id: '' });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes cours</h1>
        <Button onClick={() => setShowModal(true)}>Nouveau cours</Button>
      </div>
      <div className="grid gap-4">
        {courses?.map((c: any) => (
          <Card key={c.id}>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  {c.description && <p className="text-gray-500 text-sm mt-1">{c.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {c.chapter_number && `Chapitre ${c.chapter_number}`}
                    {c.tags?.length ? ` • ${c.tags.join(', ')}` : ''}
                  </p>
                </div>
                <Badge variant={c.is_published ? 'success' : 'warning'}>
                  {c.is_published ? 'Publié' : 'Brouillon'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}
        {(!courses || courses.length === 0) && (
          <p className="text-gray-400 text-center py-12">Aucun cours pour le moment</p>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau cours">
        <div className="space-y-4">
          <input
            placeholder="Titre"
            className="w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
          >
            <option value="">Matière</option>
            {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button
            className="w-full"
            onClick={() => createMutation.mutate(form)}
            loading={createMutation.isPending}
          >
            Créer le cours
          </Button>
        </div>
      </Modal>
    </div>
  );
}