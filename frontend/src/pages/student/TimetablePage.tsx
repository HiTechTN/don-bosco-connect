/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { motion } from 'framer-motion';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const dayLabels: Record<string, string> = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi' };
const periods = [
  { label: '08:00 - 09:00', start: '08:00' }, { label: '09:00 - 10:00', start: '09:00' },
  { label: '10:00 - 11:00', start: '10:00' }, { label: '11:00 - 12:00', start: '11:00' },
  { label: '14:00 - 15:00', start: '14:00' }, { label: '15:00 - 16:00', start: '15:00' },
  { label: '16:00 - 17:00', start: '16:00' },
];

export default function StudentTimetable() {
  const { data: slots } = useQuery({ queryKey: ['my-timetable'], queryFn: () => api.get('/timetable/my').then(r => r.data) });

  function getSlot(day: string, startTime: string) {
    return slots?.find((s: any) => s.day === day && s.start_time === startTime);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon emploi du temps</h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Horaire</th>
              {days.map((d) => <th key={d} className="px-4 py-3 text-left text-sm font-medium text-gray-500">{dayLabels[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.start} className="border-t">
                <td className="px-4 py-3 text-sm text-gray-500 font-medium">{period.label}</td>
                {days.map((day) => {
                  const slot = getSlot(day, period.start);
                  return (
                    <td key={day} className="px-2 py-2 text-sm border-l">
                      {slot ? (
                        <div className="rounded-lg p-2 text-xs" style={{ backgroundColor: slot.subject_color ? `${slot.subject_color}20` : '#EFF6FF', borderLeft: `3px solid ${slot.subject_color || '#3B82F6'}` }}>
                          <div className="font-semibold" style={{ color: slot.subject_color }}>{slot.subject_name}</div>
                          {slot.teacher_name && <div className="text-gray-500 mt-0.5">{slot.teacher_name}</div>}
                          {slot.room && <div className="text-gray-400">{slot.room}</div>}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
