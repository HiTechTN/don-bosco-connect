import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { GraduationCap } from 'lucide-react';

export default function ParentGrades() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: children } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.get('/users/me/children').then(r => r.data),
  });

  const { data: grades } = useQuery({
    queryKey: ['parent-grades', selectedStudent],
    queryFn: () => api.get(`/students/${selectedStudent}/grades`).then(r => r.data),
    enabled: !!selectedStudent,
  });

  const subjectAvgs = (grades || []).filter((g: Record<string, unknown>) => g.score != null).reduce((acc: Record<string, number[]>, g: Record<string, unknown>) => {
    const subj = g.subject_name || 'Général';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(g.score as number);
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notes des enfants</h1>

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

      {selectedStudent ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(subjectAvgs).map(([name, scores]) => {
              const avg = (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2);
              return (
                <motion.div key={name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow-sm text-center">
                  <div className="text-xs text-gray-500 mb-1">{name}</div>
                  <div className={`text-2xl font-bold ${parseFloat(avg) >= 10 ? 'text-green-600' : 'text-red-500'}`}>{avg}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-2">
            {grades?.length === 0 && <div className="text-center py-8 text-gray-400">Aucune note</div>}
            {grades?.map((g: Record<string, unknown>) => (
              <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`font-semibold text-lg ${g.is_absent ? 'text-red-500' : parseFloat(g.score) >= 10 ? 'text-green-600' : 'text-gray-900'}`}>
                      {g.is_absent ? 'Absent' : `${g.score}/20`}
                    </span>
                    {g.comment && <p className="text-sm text-gray-400 mt-0.5">{g.comment}</p>}
                  </div>
                  {g.graded_at && <span className="text-xs text-gray-400">{new Date(g.graded_at).toLocaleDateString('fr-FR')}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Sélectionnez un enfant pour voir ses notes</p>
        </div>
      )}
    </div>
  );
}
