import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Database, UserCheck, Lock, Trash2, Mail } from 'lucide-react';

export default function PolitiqueRGPDPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('rgpd.meta_title')}</title>
        <meta name="description" content={t('rgpd.meta_desc')} />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium mb-6 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {t('common.back_to_home')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('rgpd.title')}</h1>
          <p className="text-white/60 mt-2">{t('rgpd.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 md:p-12 shadow-sm space-y-10">

          {/* Introduction */}
          <section>
            <p className="text-[#475569] leading-relaxed">
              {t('rgpd.intro')}
            </p>
          </section>

          {/* Responsable */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.controller')}
            </h2>
            <div className="text-[#475569] leading-relaxed space-y-1">
              <p><strong>Institut Don Bosco Tunis</strong></p>
              <p>Avenue de la République, Tunis 1002, Tunisie</p>
              <p>Email : <strong>rgpd@donbosco.tn</strong></p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.collected_data')}
            </h2>
            <p className="text-[#475569] leading-relaxed mb-3">
              {t('rgpd.collected_data_desc')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-[#475569] border border-[#E2E8F0] rounded-lg overflow-hidden">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 font-semibold`}>{t('rgpd.data_category')}</th>
                    <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 font-semibold`}>{t('rgpd.data_content')}</th>
                    <th className={`${isRtl ? 'text-right' : 'text-left'} px-4 py-3 font-semibold`}>{t('rgpd.data_purpose')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="px-4 py-3">{t('rgpd.data_identity')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_identity_content')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_identity_purpose')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">{t('rgpd.data_school')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_school_content')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_school_purpose')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">{t('rgpd.data_usage')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_usage_content')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_usage_purpose')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">{t('rgpd.data_messaging')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_messaging_content')}</td>
                    <td className="px-4 py-3">{t('rgpd.data_messaging_purpose')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('rgpd.legal_basis')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('rgpd.legal_basis_desc')}
            </p>
            <ul className={`list-disc list-inside text-[#475569] space-y-1 mt-2 ${isRtl ? 'mr-4' : 'ml-4'}`}>
              <li><strong>{t('rgpd.basis_contract')}</strong> — {t('rgpd.basis_contract_desc')}</li>
              <li><strong>{t('rgpd.basis_legal')}</strong> — {t('rgpd.basis_legal_desc')}</li>
              <li><strong>{t('rgpd.basis_legitimate')}</strong> — {t('rgpd.basis_legitimate_desc')}</li>
              <li><strong>{t('rgpd.basis_consent')}</strong> — {t('rgpd.basis_consent_desc')}</li>
            </ul>
          </section>

          {/* Conservation */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.retention')}
            </h2>
            <div className="text-[#475569] leading-relaxed space-y-2">
              <p>• <strong>{t('rgpd.retention_students')}</strong> : {t('rgpd.retention_students_desc')}</p>
              <p>• <strong>{t('rgpd.retention_teachers')}</strong> : {t('rgpd.retention_teachers_desc')}</p>
              <p>• <strong>{t('rgpd.retention_messaging')}</strong> : {t('rgpd.retention_messaging_desc')}</p>
              <p>• <strong>{t('rgpd.retention_logs')}</strong> : {t('rgpd.retention_logs_desc')}</p>
              <p>• <strong>{t('rgpd.retention_analytics')}</strong> : {t('rgpd.retention_analytics_desc')}</p>
            </div>
          </section>

          {/* Droits */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.rights')}
            </h2>
            <p className="text-[#475569] leading-relaxed mb-3">
              {t('rgpd.rights_desc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { titleKey: 'rgpd.right_access', descKey: 'rgpd.right_access_desc' },
                { titleKey: 'rgpd.right_rectification', descKey: 'rgpd.right_rectification_desc' },
                { titleKey: 'rgpd.right_erasure', descKey: 'rgpd.right_erasure_desc' },
                { titleKey: 'rgpd.right_portability', descKey: 'rgpd.right_portability_desc' },
                { titleKey: 'rgpd.right_opposition', descKey: 'rgpd.right_opposition_desc' },
                { titleKey: 'rgpd.right_limitation', descKey: 'rgpd.right_limitation_desc' },
              ].map((right) => (
                <div key={right.titleKey} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="font-semibold text-[#1E293B] text-sm">{t(right.titleKey)}</p>
                  <p className="text-[#64748B] text-sm mt-1">{t(right.descKey)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.security')}
            </h2>
            <p className="text-[#475569] leading-relaxed mb-3">
              {t('rgpd.security_desc')}
            </p>
            <ul className={`list-disc list-inside text-[#475569] space-y-1 ${isRtl ? 'mr-4' : 'ml-4'}`}>
              <li>{t('rgpd.security_tls')}</li>
              <li>{t('rgpd.security_bcrypt')}</li>
              <li>{t('rgpd.security_aes')}</li>
              <li>{t('rgpd.security_cookies')}</li>
              <li>{t('rgpd.security_ratelimit')}</li>
              <li>{t('rgpd.security_audit')}</li>
              <li>{t('rgpd.security_local')}</li>
              <li>{t('rgpd.security_backup')}</li>
            </ul>
          </section>

          {/* Mineurs */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4">{t('rgpd.minors')}</h2>
            <p className="text-[#475569] leading-relaxed">
              {t('rgpd.minors_desc1')}
            </p>
            <p className="text-[#475569] leading-relaxed mt-3">
              {t('rgpd.minors_desc2')}
            </p>
          </section>

          {/* Suppression */}
          <section>
            <h2 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#1B4F72]" />
              {t('rgpd.deletion')}
            </h2>
            <p className="text-[#475569] leading-relaxed">
              {t('rgpd.deletion_desc')}
            </p>
            <div className="mt-4 bg-[#F8FAFC] rounded-xl p-6 border border-[#E2E8F0]">
              <p className="flex items-center gap-2 text-[#1E293B] font-semibold">
                <Mail className="w-5 h-5 text-[#1B4F72]" />
                {t('rgpd.dpo')}
              </p>
              <p className="text-[#475569] mt-2">📧 rgpd@donbosco.tn</p>
              <p className="text-[#475569]">📞 +216 71 123 456</p>
              <p className="text-[#64748B] text-sm mt-2">{t('rgpd.response_time')}</p>
            </div>
          </section>

          {/* Mise à jour */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 text-sm text-[#64748B]">
            <p>{t('common.last_updated')}</p>
            <p className="mt-1">{t('rgpd.policy_update')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
