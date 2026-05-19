import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'student', status: 'active' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () =>
      api.get('/users', { params: { page, per_page: 20, search: search || undefined, role: roleFilter || undefined } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (user: typeof form) => api.post('/users', user),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (user: { id: string; data: any }) => api.patch(`/users/${user.id}`, user.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setEditUser(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  function resetForm() { setForm({ email: '', password: '', first_name: '', last_name: '', role: 'student', status: 'active' }); }

  function openEdit(user: any) {
    setEditUser(user);
    setForm({ email: user.email, password: '', first_name: user.first_name, last_name: user.last_name, role: user.role, status: user.status });
  }

  function roleBadge(role: string) {
    const colors: any = { admin: 'bg-red-50 text-red-700', teacher: 'bg-blue-50 text-blue-700', student: 'bg-green-50 text-green-700', parent: 'bg-purple-50 text-purple-700' };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[role] || 'bg-gray-50'}`}>{role}</span>;
  }

  function statusBadge(status: string) {
    const ok = status === 'active';
    return <span className={`px-2 py-1 text-xs rounded-full ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{status}</span>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nouvel utilisateur
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg flex-1" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Enseignant</option>
          <option value="student">Élève</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {(showForm || editUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Modifier' : 'Nouvel'} utilisateur</h2>
            <div className="space-y-3">
              <input placeholder="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              {!editUser && <input placeholder="Mot de passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />}
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="admin">Admin</option>
                <option value="teacher">Enseignant</option>
                <option value="student">Élève</option>
                <option value="parent">Parent</option>
              </select>
              {editUser && (
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              )}
              <div className="flex gap-3">
                <button onClick={() => editUser ? updateMutation.mutate({ id: editUser.id, data: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editUser ? 'Enregistrer' : 'Créer'}
                </button>
                <button onClick={() => { setShowForm(false); setEditUser(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nom</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Rôle</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Statut</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">MFA</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Dernière connexion</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : (
              data?.items?.map((user: any) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">{roleBadge(user.role)}</td>
                  <td className="px-6 py-4">{statusBadge(user.status)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${user.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`}>{user.mfa_enabled ? 'Activé' : 'Désactivé'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Modifier</button>
                      <button onClick={() => { if (confirm('Supprimer cet utilisateur ?')) deleteMutation.mutate(user.id); }} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Précédent</button>
          <span className="px-4 py-2">Page {page} / {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
