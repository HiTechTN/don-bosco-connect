import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Mail, Phone, Globe } from 'lucide-react';

export default function MentionsLegalesPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className={`min-h-screen bg-[#F8FAFC]`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('legal.meta_title')}</title>
        <meta name="description" content={t('legal.meta_desc')} />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-white/70 hover:text-white font-medium mb-6 transition-colors`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t('common.back_to_home')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('legal.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 md:p-12 shadow-sm space-y-10">

          {/* Éditeur */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1B4F72]" />
              {t('legal.publisher')}
            </h2>
            <div className="text-[#475569] leading-relaxed space-y-1">
              <p><strong>Institut Don Bosco Tunis</strong></p>
              <p>Avenue de la République, Tunis 1002, Tunisie</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#64748B]" /> +216 71 123 456</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#64748B]" /> contact@donbosco.tn</p>
              <p className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#64748B]" /> donbosco.tn</p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.director')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.director_desc')}
            </p>
          </section>

          {/* Hébergeur */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.host')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.host_desc')}
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.ip')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.ip_desc1')}
            </p>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('legal.ip_desc2')}
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.personal_data')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.personal_data_desc1')}
            </p>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('legal.personal_data_desc2')} <strong>rgpd@donbosco.tn</strong>.
            </p>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('legal.personal_data_link').split('Politique RGPD')[0]}
              <Link to="/politique-rgpd" className="text-[#1B4F72] hover:text-[#F39C12] font-medium transition-colors">
                {isRtl ? 'سياسة RGPD' : 'Politique RGPD'}
              </Link>
              {t('legal.personal_data_link').split('Politique RGPD')[1]}
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.cookies')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.cookies_desc1')}
            </p>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('legal.cookies_used')}
            </p>
            <ul className={`list-disc list-inside text-[#475569] space-y-1 mt-2 ${isRtl ? 'mr-4' : 'ml-4'}`}>
              <li><strong>access_token</strong> — {t('legal.cookie_access')}</li>
              <li><strong>refresh_token</strong> — {t('legal.cookie_refresh')}</li>
            </ul>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('legal.cookies_technical')}
            </p>
          </section>

          {/* applicable law */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('legal.applicable_law')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('legal.applicable_law_desc')}
            </p>
          </section>

          {/* Mise à jour */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 text-sm text-[#64748B]">
            <p>{t('common.last_updated')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
