import { Link } from 'react-router-dom';
import { Megaphone, Pin } from 'lucide-react';

interface AnnouncementCardProps {
  title: string;
  excerpt: string | null;
  category: string;
  coverImageUrl?: string | null;
  publishAt: string | null;
  slug: string;
  pinned?: boolean;
  reactions?: Record<string, number> | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-blue-100', text: 'text-blue-700' },
  evenement: { bg: 'bg-amber-100', text: 'text-amber-700' },
  academique: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pedagogique: { bg: 'bg-purple-100', text: 'text-purple-700' },
  vie_scolaire: { bg: 'bg-pink-100', text: 'text-pink-700' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AnnouncementCard({
  title,
  excerpt,
  category,
  coverImageUrl,
  publishAt,
  slug,
  pinned,
  reactions,
}: AnnouncementCardProps) {
  const catStyle = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;
  const totalReactions = reactions
    ? Object.values(reactions).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Link
      to={`/annonces/${slug}`}
      data-testid="announce-card"
      className="group block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Cover Image */}
      {coverImageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={coverImageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {pinned && (
            <div className="absolute top-3 left-3 bg-[#F39C12] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Épinglée
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] flex items-center justify-center">
          <Megaphone className="w-10 h-10 text-white/20" />
          {pinned && (
            <div className="absolute top-3 left-3 bg-[#F39C12] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Épinglée
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
          </span>
          {publishAt && (
            <span className="text-xs text-[#64748B]">{formatDate(publishAt)}</span>
          )}
        </div>

        <h3 className="font-semibold text-[#1E293B] mb-2 line-clamp-2 group-hover:text-[#1B4F72] transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-[#64748B] line-clamp-3 mb-3">{excerpt}</p>
        )}

        {totalReactions > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            {Object.entries(reactions ?? {}).map(([emoji, count]) => (
              <span key={emoji} className="bg-gray-100 px-1.5 py-0.5 rounded">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
