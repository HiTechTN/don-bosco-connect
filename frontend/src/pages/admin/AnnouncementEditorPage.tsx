import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Image, Paperclip, X,
} from 'lucide-react';
import {
  useAdminAnnouncement,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  usePublishAnnouncement,
} from '@/hooks/useAnnouncements';

const CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'evenement', label: 'Événement' },
  { value: 'academique', label: 'Académique' },
  { value: 'pedagogique', label: 'Pédagogique' },
  { value: 'vie_scolaire', label: 'Vie scolaire' },
];

interface AnnouncementData {
  title: string;
  title_ar: string;
  excerpt: string;
  content_json: Record<string, unknown>;
  category: string;
  tags: string[];
  visibility: string;
  pinned: boolean;
  priority: number;
  publish_at: string;
}

export default function AnnouncementEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<AnnouncementData>({
    title: '', title_ar: '', excerpt: '', content_json: { type: 'doc', content: [{ type: 'paragraph' }] },
    category: 'general', tags: [], visibility: 'public', pinned: false, priority: 0, publish_at: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [htmlPreview, setHtmlPreview] = useState('');

  const { data: existing } = useAdminAnnouncement(id, isEdit);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        title_ar: existing.title_ar || '',
        excerpt: existing.excerpt || '',
        content_json: existing.content_json || { type: 'doc', content: [{ type: 'paragraph' }] },
        category: existing.category || 'general',
        tags: existing.tags || [],
        visibility: existing.visibility || 'public',
        pinned: existing.pinned || false,
        priority: existing.priority || 0,
        publish_at: existing.publish_at ? existing.publish_at.slice(0, 16) : '',
      });
    }
  }, [existing]);

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const publishMutation = usePublishAnnouncement();

  const handleSaveDraft = () => {
    if (isEdit) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate({ ...form, status: 'draft' });
    }
  };

  const handlePublish = () => {
    if (isEdit && existing) {
      updateMutation.mutate(form, {
        onSuccess: () => publishMutation.mutate(existing.id),
      });
    } else {
      createMutation.mutate({ ...form, status: 'published' });
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const updateField = <K extends keyof AnnouncementData>(key: K, value: AnnouncementData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/announcements')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#64748B]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {isEdit ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || !form.title}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Enregistrer brouillon
          </button>
          <button
            onClick={handlePublish}
            disabled={isSaving || !form.title}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4F72] hover:bg-[#0D2B3E] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            Publier maintenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Titre de l'annonce"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72]"
            />
          </div>

          {/* Title AR */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Titre (arabe)</label>
            <input
              type="text"
              value={form.title_ar}
              onChange={e => updateField('title_ar', e.target.value)}
              placeholder="العنوان بالعربية"
              dir="rtl"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">
              Extrait <span className="text-[#64748B]">({form.excerpt.length}/160)</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={e => updateField('excerpt', e.target.value.slice(0, 160))}
              rows={2}
              placeholder="Résumé court de l'annonce..."
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 resize-none"
            />
          </div>

          {/* Content (Rich text - TipTap) */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">Contenu</label>
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-[#E2E8F0] px-4 py-2 flex gap-2">
                <span className="text-xs text-[#64748B]">Éditeur de contenu riche (TipTap)</span>
              </div>
              <textarea
                value={form.content_json?.content?.[0]?.content?.[0]?.text || ''}
                onChange={e => {
                  const text = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    content_json: {
                      type: 'doc',
                      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
                    },
                  }));
                  setHtmlPreview(`<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`);
                }}
                rows={12}
                placeholder="Rédigez le contenu de votre annonce ici..."
                className="w-full px-4 py-3 text-sm focus:outline-none resize-y min-h-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Catégorie</label>
            <select
              value={form.category}
              onChange={e => updateField('category', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Visibilité</label>
            <select
              value={form.visibility}
              onChange={e => updateField('visibility', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20"
            >
              <option value="public">Publique</option>
              <option value="authenticated">Utilisateurs connectés</option>
              <option value="role_based">Par rôle</option>
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag"
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20"
              />
              <button onClick={handleAddTag} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={e => updateField('pinned', e.target.checked)}
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#1B4F72] focus:ring-[#1B4F72]/20"
              />
              <span className="text-sm font-medium text-[#1E293B]">📌 Épingler en haut</span>
            </label>

            {form.pinned && (
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Priorité</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => updateField('priority', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">Planifier la publication</label>
              <input
                type="datetime-local"
                value={form.publish_at}
                onChange={e => updateField('publish_at', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
