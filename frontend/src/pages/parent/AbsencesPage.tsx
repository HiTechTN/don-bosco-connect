/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { GraduationCap, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ParentAbsences() {
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const { data: children } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/users/me/children').then(r => r.data),
  });

  const { data: absences } = useQuery({
    queryKey: ['parent-absences', selectedStudent, filter],
    queryFn: () => api.get(`/students/${selectedStudent}/absences`, { params: { from_date: filter || undefined } }).then(r => r.data),
    enabled: !!selectedStudent,
  });

  const total = (absences || []).length;
  const justified = (absences || []).filter((a: any) => a.justification_status === 'justified').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('parent_absences.title')}</h1>

      {children?.length > 0 && (
        <div className="flex gap-3 mb-6">
          {children.map((c: Record<string, unknown>) => (
            <button key={c.id} onClick={() => setSelectedStudent(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${selectedStudent === c.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:border-blue-300'}`}>
              <GraduationCap className="h-4 w-4" />
              {c.first_name} {c.last_name}
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-sm text-gray-500">{t('parent_absences.total')}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{justified}</div>
              <div className="text-sm text-gray-500">{t('parent_absences.justified')}</div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-lg">
              <Filter className="h-4 w-4 text-gray-400" />
              <input type="date" value={filter} onChange={(e) => setFilter(e.target.value)} className="border-none outline-none bg-transparent text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            {absences?.length === 0 && <div className="text-center py-8 text-gray-400">{t('parent_absences.no_absences')}</div>}
            {absences?.map((a: Record<string, unknown>) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{a.date}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${a.type === 'absence' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>                      {a.type === 'absence' ? t('parent_absences.type_absence') : t('parent_absences.type_retard')}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.justification_status === 'justified' ? 'bg-green-50 text-green-600' :
                    a.justification_status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {a.justification_status === 'justified' ? t('parent_absences.status_justified') : a.justification_status === 'pending' ? t('parent_absences.status_pending') : t('parent_absences.status_unjustified')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
