import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

export default function ClassesPage() {
  const queryClient = useQueryClient();

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => api.get('/academic-years').then((r) => r.data),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then((r) => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'teacher'],
    queryFn: () => api.get('/users', { params: { role: 'teacher', per_page: 100 } }).then((r) => r.data),
  });

  const { data: students } = useQuery({
    queryKey: ['users', 'student'],
    queryFn: () => api.get('/users', { params: { role: 'student', per_page: 100 } }).then((r) => r.data),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', level: '', section: '', academic_year_id: '', main_teacher_id: '', max_students: 30 });
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowForm(false);
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (data: { student_id: string; academic_year_id: string }) =>
      api.post(`/classes/${selectedClass.id}/students`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      setEnrollStudentId('');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nouvelle classe
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {classes?.map((cls: any) => (
          <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md" onClick={() => setSelectedClass(cls)}>
            <h3 className="font-bold text-lg">{cls.name}</h3>
            <p className="text-sm text-gray-500">Niveau: {cls.level}</p>
            <p className="text-sm text-gray-500">Places: {cls.max_students}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouvelle classe</h2>
            <div className="space-y-3">
              <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Niveau" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Année scolaire</option>
                {years?.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
              <select value={form.main_teacher_id} onChange={(e) => setForm({ ...form, main_teacher_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Professeur principal</option>
                {users?.items?.map((u: any) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
              <input type="number" placeholder="Max élèves" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-3">
                <button onClick={() => createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Créer</button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{selectedClass.name}</h2>
            <p className="text-gray-600 mb-4">Niveau: {selectedClass.level} | Section: {selectedClass.section}</p>
            <h3 className="font-semibold mb-2">Inscrire un élève</h3>
            <div className="flex gap-2 mb-4">
              <select value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg">
                <option value="">Sélectionner un élève</option>
                {students?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <button onClick={() => enrollMutation.mutate({ student_id: enrollStudentId, academic_year_id: selectedClass.academic_year_id })} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Inscrire
              </button>
            </div>
            <button onClick={() => setSelectedClass(null)} className="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}