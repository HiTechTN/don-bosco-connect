import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find(l => l.code === i18n.language) ?? languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function changeLang(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.lang = code;
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 min-w-[140px] z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                i18n.language === lang.code
                  ? 'bg-[#1B4F72] text-white font-semibold'
                  : 'text-[#1E293B] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
