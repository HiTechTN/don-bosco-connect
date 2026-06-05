import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function PublicLayout() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('public_nav.home') },
    { to: '/annonces', label: t('public_nav.announcements') },
    { to: '/contact', label: t('public_nav.contact') },
  ];

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0D2B3E]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-[#F39C12]/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#F39C12]" />
              </div>
              <span className="text-white font-bold text-lg hidden sm:block">Don Bosco Connect</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side: Language Switcher + Login CTA + Mobile Toggle */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-4 py-2 bg-[#F39C12] hover:bg-[#E67E22] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {t('auth.login')}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0D2B3E]">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 bg-[#F39C12] hover:bg-[#E67E22] text-white text-sm font-semibold rounded-lg transition-colors text-center mt-2"
              >
                {t('auth.login')}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Shared Footer */}
      <footer className="bg-[#0D2B3E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-8 h-8 text-[#F39C12]" />
                <span className="text-xl font-bold">Don Bosco Connect</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                {t('public_footer.tagline')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/80">{t('public_footer.contact')}</h3>
              <ul className="space-y-2 text-white/60">
                <li>📍 {t('public_footer.address')}</li>
                <li>📞 +216 71 123 456</li>
                <li>✉️ contact@donbosco.tn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/80">{t('public_footer.useful_links')}</h3>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('public_nav.contact')}</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-white transition-colors">{t('public_footer.legal')}</Link></li>
                <li><Link to="/politique-rgpd" className="hover:text-white transition-colors">{t('public_footer.rgpd')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
            © 2026 Don Bosco Connect. {t('public_footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
