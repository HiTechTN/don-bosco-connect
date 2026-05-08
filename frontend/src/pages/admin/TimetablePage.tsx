import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function TimetablePage() {
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then((r) => r.data),
  });

  const { data: slots } = useQuery({
    queryKey: ['timetable', selectedClassId],
    queryFn: () => api.get('/timetable', { params: { class_id: selectedClassId || undefined } }).then((r) => r.data),
    enabled: !!selectedClassId,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/subjects').then((r) => r.data),
  });

  const { data: teachers } = useQuery({
    queryKey: ['users', 'teacher'],
    queryFn: () => api.get('/users', { params: { role: 'teacher', per_page: 100 } }).then((r) => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Emploi du temps</h1>

      <div className="mb-6">
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="">Sélectionner une classe</option>
          {classes?.map((cls: any) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
        </select>
      </div>

      {selectedClassId && (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Horaire</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-500 capitalize">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                <tr key={period} className="border-t">
                  <td className="px-4 py-3 text-sm text-gray-500">Période {period}</td>
                  {days.map((day) => {
                    const slot = slots?.find((s: any) => s.day === day);
                    return (
                      <td key={day} className="px-4 py-3 text-sm">
                        {slot && slot.day === day ? (
                          <div className="bg-blue-50 p-2 rounded text-blue-700">
                            <div className="font-medium">{slot.subject_name || 'Matière'}</div>
                            <div className="text-xs">{slot.teacher_name || 'Professeur'}</div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}