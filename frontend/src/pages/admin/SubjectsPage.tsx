import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function SubjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/subjects').then((r) => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Matières</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Code</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nom</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nom (Arabe)</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Coefficient</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : (
              data?.items?.map((subject: any) => (
                <tr key={subject.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">{subject.code}</span></td>
                  <td className="px-6 py-4">{subject.name}</td>
                  <td className="px-6 py-4">{subject.name_ar}</td>
                  <td className="px-6 py-4">{subject.coefficient}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}