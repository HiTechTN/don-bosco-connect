import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, Plus, Search, Pencil, Trash2, Eye, Archive, Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useAdminAnnouncements,
  usePublishAnnouncement,
  useArchiveAnnouncement,
  useDeleteAnnouncement,
  type AdminAnnouncement,
} from '@/hooks/useAnnouncements';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-orange-100 text-orange-700',
};

export default function AnnouncementsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminAnnouncements({
    status: statusFilter || undefined,
    q: search || undefined,
  });

  const publishMutation = usePublishAnnouncement();
  const archiveMutation = useArchiveAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const items = (data?.items ?? []) as AdminAnnouncement[];

  const STATUS_TABS = [
    { value: '', labelKey: 'admin_announcements.tab_all' },
    { value: 'draft', labelKey: 'admin_announcements.tab_draft' },
    { value: 'published', labelKey: 'admin_announcements.tab_published' },
    { value: 'archived', labelKey: 'admin_announcements.tab_archived' },
  ];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-[#1B4F72]" />
          <h1 className="text-2xl font-bold text-[#1E293B]">{t('admin_announcements.title')}</h1>
        </div>
        <Link
          to="/admin/announcements/new"
          className="inline-flex items-center gap-2 bg-[#1B4F72] hover:bg-[#0D2B3E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin_announcements.new')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('admin_announcements.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>
        <div className="flex gap-2">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#1B4F72] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#1B4F72]'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#64748B]">{t('admin_announcements.loading')}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('admin_announcements.empty')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#E2E8F0]">
              <tr>
                <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_title')}</th>
                <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_category')}</th>
                <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_status')}</th>
                <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_views')}</th>
                <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_date')}</th>
                <th className={`${isRtl ? 'text-left' : 'text-right'} px-4 py-3 text-xs font-semibold text-[#64748B] uppercase`}>{t('admin_announcements.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {items.map(ann => (
                <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ann.pinned && <span className="text-[#F39C12] text-xs">📌</span>}
                      <span className="font-medium text-[#1E293B]">{ann.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{ann.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[ann.status] ?? ''}`}>
                      {t(`admin_announcements.status_${ann.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{ann.views_count}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(ann.created_at, i18n.language, { month: 'short', fallback: '—' })}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                      <Link
                        to={`/annonces/${ann.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1B4F72] transition-colors"
                        title={t('admin_announcements.action_view')}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/announcements/edit/${ann.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1B4F72] transition-colors"
                        title={t('admin_announcements.action_edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {ann.status === 'draft' && (
                        <button
                          onClick={() => publishMutation.mutate(ann.id)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#64748B] hover:text-emerald-600 transition-colors"
                          title={t('admin_announcements.action_publish')}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {ann.status === 'published' && (
                        <button
                          onClick={() => archiveMutation.mutate(ann.id)}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-[#64748B] hover:text-orange-600 transition-colors"
                          title={t('admin_announcements.action_archive')}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(t('admin_announcements.confirm_delete'))) deleteMutation.mutate(ann.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-600 transition-colors"
                        title={t('admin_announcements.action_delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
