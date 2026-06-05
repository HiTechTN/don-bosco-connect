/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherGrades() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedEval, setSelectedEval] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subject_id: '', class_id: '', type: 'devoir', max_score: 20, coefficient: 1 });

  const { data: evaluations } = useQuery({ queryKey: ['teacher-evaluations'], queryFn: () => api.get('/evaluations').then(r => r.data) });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then(r => r.data) });
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then(r => r.data) });
  const { data: grades } = useQuery({ queryKey: ['evaluation-grades', selectedEval], queryFn: () => api.get(`/evaluations/${selectedEval}/grades`).then(r => r.data), enabled: !!selectedEval });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/evaluations', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacher-evaluations'] }); setShowForm(false); },
  });

  const publishMutation = useMutation({
    mutationFn: (data: { id: string; published: boolean }) => api.patch(`/evaluations/${data.id}`, { is_published: data.published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-evaluations'] }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Évaluations</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Nouvelle
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm mb-4">
            <h3 className="font-semibold mb-3">Nouvelle évaluation</h3>
            <div className="space-y-3">
              <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="devoir">Devoir</option>
                  <option value="examen">Examen</option>
                  <option value="controle">Contrôle</option>
                  <option value="quiz">Quiz</option>
                </select>
                <input type="number" placeholder="Note max" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: parseInt(e.target.value) })} className="px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">Matière</option>
                  {subjects?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">Classe</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={() => createMutation.mutate(form)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Créer</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {evaluations?.length === 0 && <div className="text-center py-8 text-gray-400">Aucune évaluation</div>}
          {evaluations?.map((e: any) => (
            <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 ${selectedEval === e.id ? 'border-blue-500' : 'border-transparent'}`} onClick={() => setSelectedEval(e.id)}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.type} · Coef. {e.coefficient}</p>
                </div>
                <button onClick={(ev) => { ev.stopPropagation(); publishMutation.mutate({ id: e.id, published: !e.is_published }); }} className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${e.is_published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {e.is_published ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {e.is_published ? 'Publié' : 'Brouillon'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Notes {selectedEval ? '' : '(sélectionnez une évaluation)'}
        </h2>
        <div className="space-y-2">
          {selectedEval && grades?.length === 0 && <div className="text-center py-8 text-gray-400">Aucune note pour cette évaluation</div>}
          {grades?.map((g: any) => (
            <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${g.is_absent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {g.is_absent ? 'AB' : g.score ?? '-'}
                </div>
                <div>
                  <p className="font-medium">{g.student_name || 'Élève'}</p>
                  {g.comment && <p className="text-xs text-gray-500">{g.comment}</p>}
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg ${g.score >= 10 ? 'text-green-600' : 'text-red-500'}`}>{g.score ?? '-'}/20</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
