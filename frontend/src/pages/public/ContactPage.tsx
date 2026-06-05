import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = t('contact.form.name_required');
    if (!formData.email.trim()) errs.email = t('contact.form.email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = t('contact.form.email_invalid');
    if (!formData.subject.trim()) errs.subject = t('contact.form.subject_required');
    if (!formData.message.trim()) errs.message = t('contact.form.message_required');
    else if (formData.message.trim().length < 10) errs.message = t('contact.form.message_min');
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('contact.meta_title')}</title>
        <meta name="description" content={t('contact.meta_desc')} />
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('contact.title')}</h1>
          <p className="text-white/70 mt-3 text-lg">{t('contact.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1E293B] mb-6">{t('contact.info_title')}</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4F72]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] text-sm">{t('contact.address_label')}</h3>
                    <p className="text-[#64748B] text-sm mt-0.5">Avenue de la République, Tunis 1002</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4F72]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] text-sm">{t('contact.phone_label')}</h3>
                    <a href="tel:+21671123456" className="text-[#64748B] text-sm mt-0.5 hover:text-[#1B4F72] transition-colors block">
                      +216 71 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4F72]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] text-sm">{t('contact.email_label')}</h3>
                    <a href="mailto:contact@donbosco.tn" className="text-[#64748B] text-sm mt-0.5 hover:text-[#1B4F72] transition-colors block">
                      contact@donbosco.tn
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4F72]/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] text-sm">{t('contact.website_label')}</h3>
                    <a href="https://donbosco.tn" target="_blank" rel="noopener noreferrer" className="text-[#64748B] text-sm mt-0.5 hover:text-[#1B4F72] transition-colors block">
                      donbosco.tn
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4F72]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#1B4F72]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] text-sm">{t('contact.hours_label')}</h3>
                    <p className="text-[#64748B] text-sm mt-0.5">{t('contact.hours_value')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1E293B] mb-6">{t('contact.form_title')}</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2">{t('contact.form.success_title')}</h3>
                  <p className="text-[#64748B]">{t('contact.form.success_desc')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#1E293B] mb-1.5">
                        {t('contact.form.name')}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/30 focus:border-[#1B4F72] transition-colors`}
                        placeholder={t('contact.form.name_placeholder')}
                      />
                      {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-1.5">
                        {t('contact.form.email')}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/30 focus:border-[#1B4F72] transition-colors`}
                        placeholder={t('contact.form.email_placeholder')}
                      />
                      {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#1E293B] mb-1.5">
                      {t('contact.form.subject')}
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={e => handleChange('subject', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.subject ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/30 focus:border-[#1B4F72] transition-colors`}
                      placeholder={t('contact.form.subject_placeholder')}
                    />
                    {errors.subject && <p className="text-[#EF4444] text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#1E293B] mb-1.5">
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={e => handleChange('message', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.message ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} bg-[#F8FAFC] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/30 focus:border-[#1B4F72] transition-colors resize-none`}
                      placeholder={t('contact.form.message_placeholder')}
                    />
                    {errors.message && <p className="text-[#EF4444] text-xs mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#1B4F72] hover:bg-[#163D5A] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    {t('contact.form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
