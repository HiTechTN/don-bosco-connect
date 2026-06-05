import { useState } from 'react';
import { Megaphone, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { usePublicAnnouncements, type PublicAnnouncement } from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/public/AnnouncementCard';

export default function AnnouncesPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePublicAnnouncements({
    category: category || undefined,
    q: search || undefined,
    per_page: 50,
  });

  const announcements: PublicAnnouncement[] = data?.items ?? [];

  const CATEGORIES = [
    { value: '', labelKey: 'announces.cat_all' },
    { value: 'general', labelKey: 'announces.cat_general' },
    { value: 'evenement', labelKey: 'announces.cat_evenement' },
    { value: 'academique', labelKey: 'announces.cat_academique' },
    { value: 'pedagogique', labelKey: 'announces.cat_pedagogique' },
    { value: 'vie_scolaire', labelKey: 'announces.cat_vie_scolaire' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('announces.title') + ' — ' + t('app.name')}</title>
        <meta name="description" content={t('announces.desc')} />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="w-8 h-8 text-[#F39C12]" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('announces.title')}</h1>
          </div>
          <p className="text-white/70 text-lg">
            {t('announces.desc')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t('announces.search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] transition ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === cat.value
                    ? 'bg-[#1B4F72] text-white shadow'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#1B4F72] hover:text-[#1B4F72]'
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map(ann => (
              <AnnouncementCard key={ann.id} {...ann} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#64748B]">
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl mb-2">{t('announces.no_results')}</p>
            <p className="text-sm">{t('announces.no_results_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
