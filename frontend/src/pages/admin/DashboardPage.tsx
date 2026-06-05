import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Users, GraduationCap, BookOpen, BrainCircuit, Activity, TrendingUp } from 'lucide-react';
import type { AnalyticsDashboard, AnalyticsGrades, AnalyticsAIUsage, AnalyticsQuizStats, AuditLog } from '../../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const locale = isRtl ? 'ar-TN' : 'fr-FR';
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery<{ data: AnalyticsDashboard }>({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/analytics/dashboard').then((r) => r.data) });
  const { data: gradeDist } = useQuery<{ data: AnalyticsGrades }>({ queryKey: ['admin-grades-dist'], queryFn: () => api.get('/analytics/grades').then((r) => r.data) });
  const { data: aiUsage } = useQuery<{ data: AnalyticsAIUsage }>({ queryKey: ['admin-ai-usage'], queryFn: () => api.get('/analytics/ai-usage', { params: { days: 30 } }).then((r) => r.data) });
  const { data: quizStats } = useQuery<{ data: AnalyticsQuizStats }>({ queryKey: ['admin-quiz-stats'], queryFn: () => api.get('/analytics/quiz-stats').then((r) => r.data) });
  const { data: recentLogs } = useQuery<{ data: { items: AuditLog[] } }>({ queryKey: ['admin-recent-logs'], queryFn: () => api.get('/audit/logs', { params: { per_page: 5 } }).then((r) => r.data) });

  const statCards = [
    { label: t('admin_dashboard.stat_users'), value: stats?.total_users || 0, icon: Users, color: 'bg-blue-500' },
    { label: t('admin_dashboard.stat_teachers'), value: stats?.total_teachers || 0, icon: GraduationCap, color: 'bg-green-500' },
    { label: t('admin_dashboard.stat_students'), value: stats?.total_students || 0, icon: BookOpen, color: 'bg-yellow-500' },
    { label: t('admin_dashboard.stat_courses'), value: stats?.total_courses || 0, icon: Activity, color: 'bg-purple-500' },
    { label: t('admin_dashboard.stat_ai'), value: stats?.total_ai_conversations || 0, icon: BrainCircuit, color: 'bg-pink-500' },
    { label: t('admin_dashboard.stat_grades'), value: stats?.grades_last_30_days || 0, icon: TrendingUp, color: 'bg-indigo-500' },
  ];

  const userPie = [
    { name: t('admin_dashboard.pie_teachers'), value: stats?.total_teachers || 0 },
    { name: t('admin_dashboard.pie_students'), value: stats?.total_students || 0 },
    { name: t('admin_dashboard.pie_parents'), value: stats?.total_parents || 0 },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">{t('nav.dashboard')}</h1>
        <p className="text-gray-500 mb-6">{t('admin_dashboard.welcome', { name: `${user?.first_name} ${user?.last_name}` })}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-white p-4 rounded-xl shadow-sm">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('admin_dashboard.chart_grades_title')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeDist?.distribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="min" tickFormatter={(v: number) => `${v}-${v+5}`} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('admin_dashboard.chart_users_title')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {userPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('admin_dashboard.ai_title')}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{aiUsage?.conversations || 0}</div>
              <div className="text-xs text-gray-500">{t('admin_dashboard.ai_conversations')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{aiUsage?.user_messages || 0}</div>
              <div className="text-xs text-gray-500">{t('admin_dashboard.ai_messages')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{aiUsage?.avg_tokens_per_response || 0}</div>
              <div className="text-xs text-gray-500">{t('admin_dashboard.ai_tokens')}</div>
            </div>
          </div>
          {quizStats && (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-indigo-600">{quizStats.total_quizzes}</div>
                <div className="text-xs text-gray-500">{t('admin_dashboard.quiz_quizzes')}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-pink-600">{quizStats.total_attempts}</div>
                <div className="text-xs text-gray-500">{t('admin_dashboard.quiz_attempts')}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">{quizStats.average_pass_rate ?? '-'}%</div>
                <div className="text-xs text-gray-500">{t('admin_dashboard.quiz_pass_rate')}</div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">{t('admin_dashboard.recent_activity')}</h3>
          <div className="space-y-3">
            {recentLogs?.items?.length ? recentLogs.items.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <Activity className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500 ml-2">{log.resource_type && `(${log.resource_type})`}</span>
                  <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString(locale)}</div>
                </div>
              </div>
            )) : <div className="text-sm text-gray-400">{t('admin_dashboard.no_activity')}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
