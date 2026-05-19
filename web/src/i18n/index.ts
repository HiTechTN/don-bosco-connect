import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en';
import fr from './fr';
import ar from './ar';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      fr,
      ar: {
        translation: {
          ...ar.translation,
          landing: {
            ...ar.translation.landing,
            hero: {
              ...ar.translation.landing.hero,
              cta: "ابدأ الآن",
              ctaSecondary: "اعرف المزيد"
            },
            cta: {
              ...ar.translation.landing.cta,
              button: "ابدأ تجربة مجانية"
            }
          }
        }
      }
    },
    fallbackLng: 'fr',
    lng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;