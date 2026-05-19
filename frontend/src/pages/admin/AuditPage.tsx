import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [resourceType, setResourceType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, resourceType, fromDate, toDate],
    queryFn: () =>
      api.get('/audit/logs', {
        params: {
          page,
          per_page: 50,
          resource_type: resourceType || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      }).then((r) => r.data),
  });

  function exportCSV() {
    if (!data?.items?.length) return;
    const headers = ['Date', 'Action', 'Type', 'Ressource ID', 'Utilisateur'];
    const rows = data.items.map((log: any) => [
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.action,
      log.resource_type || '',
      log.resource_id || '',
      log.user_email || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal d'audit</h1>
        <button onClick={exportCSV} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-1">
          <Download className="h-4 w-4" /> Exporter CSV
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-lg">
          <Filter className="h-4 w-4 text-gray-400" />
          <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="border-none outline-none bg-transparent text-sm">
            <option value="">Tous les types</option>
            <option value="user">Utilisateur</option>
            <option value="class">Classe</option>
            <option value="subject">Matière</option>
            <option value="course">Cours</option>
            <option value="evaluation">Évaluation</option>
            <option value="absence">Absence</option>
            <option value="message">Message</option>
          </select>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-4 py-2 border rounded-lg text-sm" placeholder="Date début" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-4 py-2 border rounded-lg text-sm" placeholder="Date fin" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ID ressource</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Chargement...</td></tr>
            ) : (
              data?.items?.map((log: any) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.resource_type || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{log.resource_id ? log.resource_id.slice(0, 8) + '...' : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.user_email || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Précédent</button>
          <span className="px-4 py-2">Page {page} / {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Suivant</button>
        </motion.div>
      )}
    </div>
  );
}
