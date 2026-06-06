/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, UserCheck, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TeacherAbsences() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', date: new Date().toISOString().slice(0, 10), type: 'absence', class_id: '' });
  const [dateFilter, setDateFilter] = useState('');

  const { data: absences } = useQuery({
    queryKey: ['absences', dateFilter],
    queryFn: () => api.get('/absences', { params: { from_date: dateFilter || undefined } }).then(r => r.data),
  });
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then(r => r.data) });
  const { data: students } = useQuery({ queryKey: ['users-student'], queryFn: () => api.get('/users', { params: { role: 'student', per_page: 100 } }).then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/absences', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['absences'] }); setShowForm(false); },
  });

  const justifyMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.patch(`/absences/${data.id}`, { justification_status: data.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['absences'] }),
  });

  function statusBadge(status: string) {
    const colors: any = { justified: 'bg-green-50 text-green-700', pending: 'bg-yellow-50 text-yellow-700', unjustified: 'bg-red-50 text-red-700' };
    return <span className={`px-2 py-0.5 text-xs rounded-full ${colors[status] || 'bg-gray-50'}`}>{status === 'justified' ? t('teacher_absences.status_justified') : status === 'pending' ? t('teacher_absences.status_pending') : t('teacher_absences.status_unjustified')}</span>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teacher_absences.title')}</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="h-4 w-4" /> {t('teacher_absences.report_btn')}
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-lg">
          <Filter className="h-4 w-4 text-gray-400" />
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border-none outline-none bg-transparent text-sm" placeholder={t('teacher_absences.date_filter')} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('teacher_absences.modal_title')}</h2>
            <div className="space-y-3">
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">{t('teacher_absences.class_label')}</option>
                {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">{t('teacher_absences.student_label')}</option>
                {students?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="absence">{t('teacher_absences.type_absence')}</option>
                <option value="retard">{t('teacher_absences.type_retard')}</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t('teacher_absences.save')}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">{t('teacher_absences.cancel')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-2">
        {absences?.length === 0 && <div className="text-center py-8 text-gray-400">{t('teacher_absences.no_absences')}</div>}
        {absences?.map((a: any) => (
          <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">{a.student_name || t('teacher_absences.student_label')}</p>
                  <p className="text-xs text-gray-500">{a.date} · {a.type === 'absence' ? t('teacher_absences.type_absence') : t('teacher_absences.type_retard')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(a.justification_status)}
                {a.justification_status === 'pending' && (
                  <button onClick={() => justifyMutation.mutate({ id: a.id, status: 'justified' })} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">{t('teacher_absences.justify_btn')}</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
