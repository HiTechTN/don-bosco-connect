import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

export default function StudentTimetable() {
  const { data: slots } = useQuery({
    queryKey: ['timetable'],
    queryFn: () => api.get('/timetable').then(r => r.data),
  });

  const getSlot = (day: number, hour: string) => {
    return (slots || []).find(
      (s: any) => s.day_of_week === day && s.start_time === hour,
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Emploi du temps</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-xl shadow-sm">
          <thead>
            <tr>
              <th className="p-3 border bg-gray-50 text-left text-sm font-medium text-gray-500">Horaire</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 border bg-gray-50 text-sm font-medium text-gray-500">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="p-3 border text-sm text-gray-500 font-medium">{hour}</td>
                {DAYS.map((_, dayIdx) => {
                  const slot = getSlot(dayIdx, hour);
                  return (
                    <td key={dayIdx} className="p-2 border text-sm">
                      {slot ? (
                        <div className="bg-blue-50 rounded p-2">
                          <p className="font-medium text-blue-800">{slot.subject_name || 'Matière'}</p>
                          <p className="text-xs text-blue-600">{slot.teacher_name || ''}</p>
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
    </div>
  );
}