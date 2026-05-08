import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';

export default function AuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => api.get('/audit/logs', { params: { page, per_page: 50 } }).then((r) => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Journal d'audit</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ID ressource</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : (
              data?.items?.map((log: any) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{log.created_at}</td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4">{log.resource_type || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.resource_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Précédent</button>
          <span className="px-4 py-2">Page {page} / {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}