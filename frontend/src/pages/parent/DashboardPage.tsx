 
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, UserCheck, MessageSquare, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: children } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/users/me/children').then(r => r.data),
  });

  const cards = [
    { label: t('parent_dashboard.card_grades'), icon: ClipboardList, color: 'bg-blue-100 text-blue-600', path: '/parent/grades' },
    { label: t('parent_dashboard.card_absences'), icon: UserCheck, color: 'bg-orange-100 text-orange-600', path: '/parent/absences' },
    { label: t('parent_dashboard.card_messages'), icon: MessageSquare, color: 'bg-purple-100 text-purple-600', path: '/parent/messages' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">{t('parent_dashboard.title', { name: user?.first_name })}</h1>
        <p className="text-gray-500 mb-6">{t('parent_dashboard.subtitle')}</p>
      </motion.div>

      {children?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-blue-500" /> {t('parent_dashboard.my_children')}</h2>
          <div className="flex gap-3">
            {children.map((c: Record<string, unknown>) => (
              <div key={c.id} className="bg-white px-5 py-3 rounded-xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {c.first_name[0]}{c.last_name[0]}
                </div>
                <div>
                  <p className="font-medium">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate(c.path)}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${c.color}`}><c.icon className="h-6 w-6" /></div>
              <p className="text-lg font-semibold">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
