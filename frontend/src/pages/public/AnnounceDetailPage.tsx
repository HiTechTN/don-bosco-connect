import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, Share2 } from 'lucide-react';
import { usePublicAnnouncement } from '@/hooks/useAnnouncements';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function readingTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, '');
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export default function AnnounceDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: ann, isLoading, error } = usePublicAnnouncement(slug);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ann?.title,
          url: window.location.href,
        });
      } catch {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ann) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-4">Annonce non trouvée</h2>
          <Link to="/annonces" className="text-[#1B4F72] hover:text-[#F39C12] font-semibold">
            ← Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Cover */}
      {ann.cover_image_url ? (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={ann.cover_image_url}
            alt={ann.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-3xl mx-auto">
              <span className="bg-[#F39C12] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                {ann.category.charAt(0).toUpperCase() + ann.category.slice(1).replace('_', ' ')}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{ann.title}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] py-16">
          <div className="max-w-3xl mx-auto px-4">
            <span className="bg-[#F39C12] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
              {ann.category.charAt(0).toUpperCase() + ann.category.slice(1).replace('_', ' ')}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{ann.title}</h1>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          to="/annonces"
          className="inline-flex items-center gap-2 text-[#1B4F72] hover:text-[#F39C12] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux annonces
        </Link>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] mb-8"
        >
          {ann.publish_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(ann.publish_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {ann.views_count} vue{ann.views_count > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            📖 {readingTime(ann.content_html)} min de lecture
          </span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-[#1B4F72] transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </motion.div>

        {/* Tags */}
        {ann.tags && ann.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {ann.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-gray-100 text-[#64748B] text-xs px-3 py-1.5 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none bg-white rounded-2xl border border-[#E2E8F0] p-8 md:p-12 shadow-sm"
          dangerouslySetInnerHTML={{ __html: ann.content_html || '' }}
        />

        {/* Reactions */}
        {ann.reactions && Object.keys(ann.reactions).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h3 className="text-sm font-semibold text-[#64748B] mb-3">Réactions</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ann.reactions).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="bg-gray-100 px-4 py-2 rounded-full text-lg flex items-center gap-2"
                >
                  {emoji} <span className="text-sm font-medium text-[#64748B]">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
