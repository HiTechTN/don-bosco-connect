/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff } from 'lucide-react';

export default function TeacherCourses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', class_id: '', tags: '', chapter_number: '' });

  const { data: courses } = useQuery({ queryKey: ['teacher-courses'], queryFn: () => api.get('/courses').then(r => r.data) });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then(r => r.data) });
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/courses', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacher-courses'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => api.patch(`/courses/${data.id}`, data.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacher-courses'] }); setEditCourse(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-courses'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (data: { id: string; published: boolean }) => api.patch(`/courses/${data.id}`, { is_published: data.published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-courses'] }),
  });

  function resetForm() { setForm({ title: '', description: '', subject_id: '', class_id: '', tags: '', chapter_number: '' }); }

  function openEdit(c: any) {
    setEditCourse(c);
    setForm({ title: c.title, description: c.description || '', subject_id: c.subject_id || '', class_id: c.class_id || '', tags: c.tags?.join(', ') || '', chapter_number: c.chapter_number || '' });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="h-4 w-4" /> Nouveau cours
        </button>
      </div>

      {(showForm || editCourse) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editCourse ? 'Modifier' : 'Nouveau'} cours</h2>
            <div className="space-y-3">
              <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Chapitre" value={form.chapter_number} onChange={(e) => setForm({ ...form, chapter_number: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Tags (séparés par ,)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="px-4 py-2 border rounded-lg" />
              </div>
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Matière</option>
                {subjects?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Classe</option>
                {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => editCourse ? updateMutation.mutate({ id: editCourse.id, payload: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editCourse ? 'Enregistrer' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setEditCourse(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid gap-3">
        {courses?.length === 0 && <div className="text-center py-12 text-gray-400">Aucun cours pour le moment</div>}
        {courses?.map((c: any) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                  <div className="flex gap-2 mt-2">
                    {c.chapter_number && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">Chap. {c.chapter_number}</span>}
                    {c.tags?.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{t}</span>)}
                    <span className={`text-xs px-2 py-0.5 rounded ${c.is_published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {c.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => publishMutation.mutate({ id: c.id, published: !c.is_published })} className="p-2 hover:bg-gray-100 rounded" title={c.is_published ? 'Dépublier' : 'Publier'}>
                  {c.is_published ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 hover:bg-gray-100 rounded"><Pencil className="h-4 w-4 text-gray-500" /></button>
                <button onClick={() => { if (confirm('Supprimer ce cours ?')) deleteMutation.mutate(c.id); }} className="p-2 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4 text-red-400" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
