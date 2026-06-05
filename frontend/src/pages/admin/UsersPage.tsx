import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { User, PaginatedResponse } from '../../types';

interface UserForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: string;
}

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const locale = isRtl ? 'ar-TN' : 'fr-FR';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>({ email: '', password: '', first_name: '', last_name: '', role: 'student', status: 'active' });

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () =>
      api.get('/users', { params: { page, per_page: 20, search: search || undefined, role: roleFilter || undefined } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (user: UserForm) => api.post('/users', user),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (user: { id: string; data: Partial<UserForm> }) => api.patch(`/users/${user.id}`, user.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setEditUser(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  function resetForm() { setForm({ email: '', password: '', first_name: '', last_name: '', role: 'student', status: 'active' }); }

  function openEdit(user: User) {
    setEditUser(user);
    setForm({ email: user.email, password: '', first_name: user.first_name, last_name: user.last_name, role: user.role, status: user.status || 'active' });
  }

  const roleLabels: Record<string, string> = {
    admin: t('admin_users.role_admin'),
    teacher: t('admin_users.role_teacher'),
    student: t('admin_users.role_student'),
    parent: t('admin_users.role_parent'),
  };

  const roleBadgeColors: Record<string, string> = { admin: 'bg-red-50 text-red-700', teacher: 'bg-blue-50 text-blue-700', student: 'bg-green-50 text-green-700', parent: 'bg-purple-50 text-purple-700' };

  function roleBadge(role: string) {
    return <span className={`px-2 py-1 text-xs rounded-full ${roleBadgeColors[role] || 'bg-gray-50'}`}>{roleLabels[role] || role}</span>;
  }

  function statusBadge(status: string) {
    const ok = status === 'active';
    const label = ok ? t('admin_users.status_active') : t('admin_users.status_inactive');
    return <span className={`px-2 py-1 text-xs rounded-full ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{label}</span>;
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex justify-between items-center mb-6`}>
        <h1 className="text-2xl font-bold">{t('admin_users.title')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {t('admin_users.new')}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input type="text" placeholder={t('admin_users.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg flex-1" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="">{t('admin_users.filter_all_roles')}</option>
          <option value="admin">{t('admin_users.role_admin')}</option>
          <option value="teacher">{t('admin_users.role_teacher')}</option>
          <option value="student">{t('admin_users.role_student')}</option>
          <option value="parent">{t('admin_users.role_parent')}</option>
        </select>
      </div>

      {(showForm || editUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? t('admin_users.form_edit') : t('admin_users.form_new')}</h2>
            <div className="space-y-3">
              <input placeholder={t('admin_users.placeholder_firstname')} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder={t('admin_users.placeholder_lastname')} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder={t('admin_users.placeholder_email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              {!editUser && <input placeholder={t('admin_users.placeholder_password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />}
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserForm['role'] })} className="w-full px-4 py-2 border rounded-lg">
                <option value="admin">{t('admin_users.role_admin')}</option>
                <option value="teacher">{t('admin_users.role_teacher')}</option>
                <option value="student">{t('admin_users.role_student')}</option>
                <option value="parent">{t('admin_users.role_parent')}</option>
              </select>
              {editUser && (
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="active">{t('admin_users.status_active')}</option>
                  <option value="inactive">{t('admin_users.status_inactive')}</option>
                  <option value="suspended">{t('admin_users.status_suspended')}</option>
                </select>
              )}
              <div className="flex gap-3">
                <button onClick={() => editUser ? updateMutation.mutate({ id: editUser.id, data: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editUser ? t('admin_users.btn_save') : t('admin_users.btn_create')}
                </button>
                <button onClick={() => { setShowForm(false); setEditUser(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">{t('admin_users.btn_cancel')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_name')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_email')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_role')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_status')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_mfa')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_last_login')}</th>
              <th className={`${isRtl ? 'text-right' : 'text-left'} px-6 py-3 text-sm font-medium text-gray-500`}>{t('admin_users.col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center">{t('admin_users.loading')}</td></tr>
            ) : (
              data?.items?.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">{roleBadge(user.role)}</td>
                  <td className="px-6 py-4">{statusBadge(user.status || 'active')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${user.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`}>{user.mfa_enabled ? t('admin_users.mfa_enabled') : t('admin_users.mfa_disabled')}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString(locale) : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">{t('admin_users.action_edit')}</button>
                      <button onClick={() => { if (confirm(t('admin_users.confirm_delete'))) deleteMutation.mutate(user.id); }} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">{t('admin_users.action_delete')}</button>
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
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">{t('admin_users.prev')}</button>
          <span className="px-4 py-2">{t('admin_users.page_info', { page, pages: data.pages })}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">{t('admin_users.next')}</button>
        </div>
      )}
    </div>
  );
}
