import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardList, UserCheck, TrendingUp, BrainCircuit, Users } from 'lucide-react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ['teacher-analytics'], queryFn: () => api.get('/analytics/teacher').then(r => r.data) });
  const { data: gradeDist } = useQuery({ queryKey: ['teacher-grade-dist'], queryFn: () => api.get('/analytics/grades').then(r => r.data) });

  const stats = [
    { label: t('teacher_dashboard.stat_courses'), value: data?.total_courses ?? 0, icon: BookOpen, color: 'bg-blue-500' },
    { label: t('teacher_dashboard.stat_evaluations'), value: data?.total_evaluations ?? 0, icon: ClipboardList, color: 'bg-purple-500' },
    { label: t('teacher_dashboard.stat_grades_30d'), value: data?.grades_last_30_days ?? 0, icon: TrendingUp, color: 'bg-green-500' },
    { label: t('teacher_dashboard.stat_absences'), value: data?.total_absences_recorded ?? 0, icon: UserCheck, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">{t('teacher_dashboard.title')}</h1>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-white p-5 rounded-xl shadow-sm">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}><s.icon className="h-5 w-5 text-white" /></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('teacher_dashboard.chart_grade_dist')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeDist?.distribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="min" tickFormatter={(v: number) => `${v}-${v+5}`} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('teacher_dashboard.stats_title')}</h3>
          <div className="space-y-4">
            {data?.average_score && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <div className="text-sm text-gray-600">{t('teacher_dashboard.avg_score')}</div>
                  <div className="text-3xl font-bold text-blue-600">{data.average_score}/20</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold">{data?.total_courses || 0}</div>
                <div className="text-xs text-gray-500">{t('teacher_dashboard.courses_created')}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <BrainCircuit className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold">{data?.total_evaluations || 0}</div>
                <div className="text-xs text-gray-500">{t('teacher_dashboard.evaluations_count')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
