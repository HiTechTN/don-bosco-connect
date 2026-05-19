import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, Clock } from 'lucide-react';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const dayLabels: Record<string, string> = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi' };
const periods = [
  { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
];

export default function TimetablePage() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: 'monday', start_time: '08:00', end_time: '09:00', subject_id: '', teacher_id: '', room: '' });

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
  const { data: slots } = useQuery({ queryKey: ['timetable', selectedClassId], queryFn: () => api.get('/timetable', { params: { class_id: selectedClassId || undefined } }).then((r) => r.data), enabled: !!selectedClassId });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then((r) => r.data) });
  const { data: teachers } = useQuery({ queryKey: ['users-teacher'], queryFn: () => api.get('/users', { params: { role: 'teacher', per_page: 100 } }).then((r) => r.data) });
  const { data: years } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academic-years').then((r) => r.data) });

  const currentYear = years?.find((y: any) => y.is_current);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/timetable', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timetable'] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/timetable/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable'] }),
  });

  function getSlot(day: string, startTime: string) {
    return slots?.find((s: any) => s.day === day && s.start_time === startTime);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Emploi du temps</h1>
        {selectedClassId && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Ajouter un créneau
          </button>
        )}
      </div>

      <div className="mb-6">
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="px-4 py-2 border rounded-lg w-64">
          <option value="">Sélectionner une classe</option>
          {classes?.map((cls: any) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouveau créneau</h2>
            <div className="space-y-3">
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                {days.map((d) => <option key={d} value={d}>{dayLabels[d]}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value, end_time: e.target.value.replace(/^\d{2}/, String(parseInt(e.target.value.slice(0,2)) + 1).padStart(2, '0')) })} className="flex-1 px-4 py-2 border rounded-lg">
                  {periods.map((p) => <option key={p.start} value={p.start}>{p.label}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Salle (ex: Salle 101)" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Matière</option>
                {subjects?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Professeur</option>
                {teachers?.items?.map((t: any) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => createMutation.mutate({ ...form, class_id: selectedClassId, academic_year_id: currentYear?.id })} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Créer</button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedClassId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-24">Horaire</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-500">{dayLabels[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.start} className="border-t">
                  <td className="px-4 py-3 text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {period.label}
                  </td>
                  {days.map((day) => {
                    const slot = getSlot(day, period.start);
                    const subject = slot ? subjects?.items?.find((s: any) => s.id === slot.subject_id) : null;
                    const teacher = slot ? teachers?.items?.find((t: any) => t.id === slot.teacher_id) : null;
                    return (
                      <td key={day} className="px-2 py-2 text-sm border-l relative">
                        {slot ? (
                          <div className="rounded-lg p-2 text-xs" style={{ backgroundColor: subject?.color ? `${subject.color}20` : '#EFF6FF', borderLeft: `3px solid ${subject?.color || '#3B82F6'}` }}>
                            <div className="font-semibold" style={{ color: subject?.color }}>{subject?.name || '?'}</div>
                            <div className="text-gray-500 mt-0.5">{teacher?.first_name} {teacher?.last_name}</div>
                            <div className="text-gray-400">{slot.room || '-'}</div>
                            <button onClick={() => { if (confirm('Supprimer ce créneau ?')) deleteMutation.mutate(slot.id); }} className="absolute top-1 right-1 p-0.5 hover:bg-red-100 rounded opacity-0 hover:opacity-100 transition-opacity">
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
