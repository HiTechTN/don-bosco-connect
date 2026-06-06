/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function StudentGrades() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: grades } = useQuery({
    queryKey: ['my-grades'],
    queryFn: () => api.get(`/students/${user?.id}/grades`).then(r => r.data),
    enabled: !!user?.id,
  });

  const scoreMap = (grades || []).filter((g: any) => g.score != null).reduce((acc: any, g: any) => {
    const subj = g.subject_name || 'Général';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(g.score);
    return acc;
  }, {});

  const subjectAvgs = Object.entries(scoreMap).map(([name, scores]: [string, any]) => ({
    name, average: (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2), count: scores.length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('student_grades.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {subjectAvgs.map((s: any) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">{s.name}</div>
            <div className={`text-2xl font-bold ${parseFloat(s.average) >= 10 ? 'text-green-600' : 'text-red-500'}`}>{s.average}</div>
            <div className="text-xs text-gray-400">{t('student_grades.notes_count', { count: s.count })}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        {grades?.length === 0 && <div className="text-center py-12 text-gray-400">{t('student_grades.no_grades')}</div>}
        {grades?.map((g: any) => (
          <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className={`font-semibold text-lg ${g.is_absent ? 'text-red-500' : parseFloat(g.score) >= 10 ? 'text-green-600' : 'text-gray-900'}`}>
                  {g.is_absent ? t('student_grades.absent') : `${g.score}/20`}
                </span>
                {g.subject_name && <span className="text-sm text-gray-500 ml-2">· {g.subject_name}</span>}
                {g.comment && <p className="text-sm text-gray-400 mt-0.5">{g.comment}</p>}
              </div>
              {g.graded_at && <span className="text-xs text-gray-400">{new Date(g.graded_at).toLocaleDateString('fr-FR')}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
