/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Filter } from 'lucide-react';

export default function StudentAbsences() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('');

  const { data: absences } = useQuery({
    queryKey: ['my-absences', filter],
    queryFn: () => api.get(`/students/${user?.id}/absences`, { params: { from_date: filter || undefined } }).then(r => r.data),
    enabled: !!user?.id,
  });

  const justified = (absences || []).filter((a: any) => a.justification_status === 'justified').length;
  const pending = (absences || []).filter((a: any) => a.justification_status === 'pending').length;
  const total = (absences || []).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes absences</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{justified}</div>
          <div className="text-sm text-gray-500">Justifiées</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{pending}</div>
          <div className="text-sm text-gray-500">En attente</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-lg">
          <Filter className="h-4 w-4 text-gray-400" />
          <input type="date" value={filter} onChange={(e) => setFilter(e.target.value)} className="border-none outline-none bg-transparent text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        {absences?.length === 0 && <div className="text-center py-8 text-gray-400">Aucune absence</div>}
        {absences?.map((a: any) => (
          <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{a.date}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  a.type === 'absence' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                }`}>{a.type === 'absence' ? 'Absence' : 'Retard'}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                a.justification_status === 'justified' ? 'bg-green-50 text-green-600' :
                a.justification_status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
              }`}>
                {a.justification_status === 'justified' ? 'Justifiée' : a.justification_status === 'pending' ? 'En attente' : 'Non justifiée'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
