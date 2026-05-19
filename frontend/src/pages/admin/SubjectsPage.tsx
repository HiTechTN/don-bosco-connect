import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [form, setForm] = useState({ name: '', name_ar: '', code: '', color: '#3B82F6', coefficient: 1, description: '' });

  const { data, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then((r) => r.data) });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/subjects', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: typeof form }) => api.patch(`/subjects/${data.id}`, data.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); setEditSubject(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  function resetForm() { setForm({ name: '', name_ar: '', code: '', color: '#3B82F6', coefficient: 1, description: '' }); }

  function openEdit(subject: any) {
    setEditSubject(subject);
    setForm({ name: subject.name, name_ar: subject.name_ar || '', code: subject.code, color: subject.color, coefficient: subject.coefficient, description: subject.description || '' });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matières</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="h-4 w-4" /> Nouvelle matière
        </button>
      </div>

      {(showForm || editSubject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editSubject ? 'Modifier' : 'Nouvelle'} matière</h2>
            <div className="space-y-3">
              <input placeholder="Code (ex: MATH)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2 border rounded-lg font-mono" />
              <input placeholder="Nom (français)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Nom (arabe)" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Coefficient</label>
                  <input type="number" step="0.5" min="0.5" max="5" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: parseFloat(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Couleur</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-10 p-0.5 border rounded cursor-pointer" />
                    <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => editSubject ? updateMutation.mutate({ id: editSubject.id, payload: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editSubject ? 'Enregistrer' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setEditSubject(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-8 text-gray-500">Chargement...</div>
        ) : (
          data?.items?.map((subject: any) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: subject.color }}>
                  {subject.code?.slice(0, 3)}
                </div>
                <div>
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.name_ar} · Coef. {subject.coefficient}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(subject)} className="p-2 hover:bg-gray-100 rounded"><Pencil className="h-4 w-4 text-gray-500" /></button>
                <button onClick={() => { if (confirm(`Supprimer ${subject.name} ?`)) deleteMutation.mutate(subject.id); }} className="p-2 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4 text-red-400" /></button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
