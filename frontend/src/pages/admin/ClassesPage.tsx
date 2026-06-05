import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap, Users, UserPlus, Pencil, Trash2, X } from 'lucide-react';
import type { User, PaginatedResponse } from '../../types';

interface ClassForm {
  name: string;
  level: string;
  section: string;
  academic_year_id: string;
  main_teacher_id: string;
  max_students: number;
}

interface ClassData {
  id: string;
  name: string;
  level: string;
  section: string;
  main_teacher_id: string;
  main_teacher_name: string;
  max_students: number;
  enrollment_count: number;
  academic_year_id: string;
}

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

interface Enrollment {
  id: string;
  student_id: string;
  student_first_name: string;
  student_last_name: string;
}

export default function ClassesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: years } = useQuery<AcademicYear[]>({ queryKey: ['academic-years'], queryFn: () => api.get('/academic-years').then((r) => r.data) });
  const { data: classes } = useQuery<ClassData[]>({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
  const { data: users } = useQuery<PaginatedResponse<User>>({ queryKey: ['users-teacher'], queryFn: () => api.get('/users', { params: { role: 'teacher', per_page: 100 } }).then((r) => r.data) });
  const { data: students } = useQuery<PaginatedResponse<User>>({ queryKey: ['users-student'], queryFn: () => api.get('/users', { params: { role: 'student', per_page: 100 } }).then((r) => r.data) });

  const [showForm, setShowForm] = useState(false);
  const [editClass, setEditClass] = useState<ClassData | null>(null);
  const [form, setForm] = useState<ClassForm>({ name: '', level: '', section: '', academic_year_id: '', main_teacher_id: '', max_students: 30 });
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  const { data: classStudents } = useQuery<Enrollment[]>({
    queryKey: ['class-students', selectedClass?.id],
    queryFn: () => api.get(`/classes/${selectedClass.id}/students`).then((r) => r.data),
    enabled: !!selectedClass?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: ClassForm) => api.post('/classes', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: ClassForm }) => api.patch(`/classes/${data.id}`, data.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); setEditClass(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });

  const enrollMutation = useMutation({
    mutationFn: (data: { student_id: string; academic_year_id: string }) => api.post(`/classes/${selectedClass?.id}/students`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['class-students'] }); setEnrollStudentId(''); },
  });

  const unenrollMutation = useMutation({
    mutationFn: (enrollmentId: string) => api.delete(`/classes/enrollments/${enrollmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class-students'] }),
  });

  function resetForm() { setForm({ name: '', level: '', section: '', academic_year_id: '', main_teacher_id: '', max_students: 30 }); }

  function openEdit(cls: ClassData) {
    setEditClass(cls);
    setForm({ name: cls.name, level: cls.level, section: cls.section || '', academic_year_id: cls.academic_year_id, main_teacher_id: cls.main_teacher_id || '', max_students: cls.max_students });
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin_classes.title')}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {t('admin_classes.new')}
        </button>
      </div>

      {(showForm || editClass) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editClass ? t('admin_classes.form_edit') : t('admin_classes.form_new')}</h2>
            <div className="space-y-3">
              <input placeholder={t('admin_classes.placeholder_name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder={t('admin_classes.placeholder_level')} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder={t('admin_classes.placeholder_section')} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">{t('admin_classes.placeholder_year')}</option>
                {years?.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ` ${t('admin_classes.year_current')}` : ''}</option>)}
              </select>
              <select value={form.main_teacher_id} onChange={(e) => setForm({ ...form, main_teacher_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">{t('admin_classes.placeholder_teacher')}</option>
                {users?.items?.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
              <input type="number" placeholder={t('admin_classes.placeholder_max_students')} value={form.max_students} onChange={(e) => setForm({ ...form, max_students: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-3">
                <button onClick={() => editClass ? updateMutation.mutate({ id: editClass.id, payload: form }) : createMutation.mutate(form)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editClass ? t('admin_classes.btn_save') : t('admin_classes.btn_create')}
                </button>
                <button onClick={() => { setShowForm(false); setEditClass(null); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">{t('admin_classes.btn_cancel')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {classes?.map((cls) => {
          const capacityPct = cls.enrollment_count != null ? Math.round((cls.enrollment_count / cls.max_students) * 100) : 0;
          return (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-lg">{cls.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cls)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="h-4 w-4 text-gray-500" /></button>
                  <button onClick={() => { if (confirm(t('admin_classes.confirm_delete'))) deleteMutation.mutate(cls.id); }} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{t('admin_classes.label_level')} {cls.level} | {t('admin_classes.label_section')} {cls.section || '-'}</p>
              <p className="text-sm text-gray-500 mb-3">{t('admin_classes.label_teacher')} {cls.main_teacher_name || t('admin_classes.teacher_none')}</p>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{t('admin_classes.enrollment_count', { count: cls.enrollment_count ?? '?', max: cls.max_students })}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${capacityPct > 90 ? 'bg-red-500' : capacityPct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
              </div>
              <button onClick={() => setSelectedClass(cls)} className="mt-3 w-full text-sm text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">
                {t('admin_classes.btn_manage')}
              </button>
            </motion.div>
          );
        })}
      </div>

      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedClass.name} - {t('admin_classes.enrollments_title')}</h2>
              <button onClick={() => setSelectedClass(null)} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex gap-2 mb-4">
              <select value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg">
                <option value="">{t('admin_classes.select_student')}</option>
                {students?.items?.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <button onClick={() => enrollMutation.mutate({ student_id: enrollStudentId, academic_year_id: selectedClass.academic_year_id })} disabled={!enrollStudentId} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                <UserPlus className="h-4 w-4" /> {t('admin_classes.btn_enroll')}
              </button>
            </div>

            <h3 className="font-semibold mb-2">{t('admin_classes.enrolled_title', { count: classStudents?.length || 0 })}</h3>
            <div className="space-y-2">
              {classStudents?.length ? classStudents.map((enr) => (
                <div key={enr.id} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{enr.student_first_name} {enr.student_last_name}</span>
                  <button onClick={() => unenrollMutation.mutate(enr.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">
                    {t('admin_classes.btn_remove')}
                  </button>
                </div>
              )) : <div className="text-sm text-gray-400">{t('admin_classes.no_students')}</div>}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
