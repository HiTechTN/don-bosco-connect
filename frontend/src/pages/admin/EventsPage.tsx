import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Calendar, Clock } from 'lucide-react';

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', event_type: 'academic', start_datetime: '', end_datetime: '', all_day: false });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events', { params: { per_page: 50 } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/events', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => api.patch(`/events/${data.id}`, data.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setEditEvent(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  function resetForm() { setForm({ title: '', description: '', event_type: 'academic', start_datetime: '', end_datetime: '', all_day: false }); }

  function openEdit(event: any) {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || 'academic',
      start_datetime: event.start_datetime?.slice(0, 16) || '',
      end_datetime: event.end_datetime?.slice(0, 16) || '',
      all_day: event.all_day || false,
    });
  }

  function eventTypeBadge(type: string) {
    const colors: any = { academic: 'bg-blue-50 text-blue-700', exam: 'bg-red-50 text-red-700', holiday: 'bg-green-50 text-green-700', activity: 'bg-purple-50 text-purple-700' };
    return <span className={`px-2 py-0.5 text-xs rounded-full ${colors[type] || 'bg-gray-50'}`}>{type}</span>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Événements</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="h-4 w-4" /> Nouvel événement
        </button>
      </div>

      {(showForm || editEvent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editEvent ? 'Modifier' : 'Nouvel'} événement</h2>
            <div className="space-y-3">
              <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={3} />
              <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="academic">Académique</option>
                <option value="exam">Examen</option>
                <option value="holiday">Vacance</option>
                <option value="activity">Activité</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.all_day} onChange={(e) => setForm({ ...form, all_day: e.target.checked })} className="rounded" />
                Toute la journée
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Début</label>
                  <input type="datetime-local" value={form.start_datetime} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fin</label>
                  <input type="datetime-local" value={form.end_datetime} onChange={(e) => setForm({ ...form, end_datetime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => editEvent ? updateMutation.mutate({ id: editEvent.id, payload: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editEvent ? 'Enregistrer' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setEditEvent(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun événement</div>
        ) : (
          data?.items?.map((event: any) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {eventTypeBadge(event.event_type || 'academic')}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.start_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(event)} className="p-2 hover:bg-gray-100 rounded"><Pencil className="h-4 w-4 text-gray-500" /></button>
                <button onClick={() => { if (confirm(`Supprimer "${event.title}" ?`)) deleteMutation.mutate(event.id); }} className="p-2 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4 text-red-400" /></button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
