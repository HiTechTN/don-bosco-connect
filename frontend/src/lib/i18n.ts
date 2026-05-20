import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: require('../i18n/fr.json') },
    ar: { translation: require('../i18n/ar.json') }
  },
  lng: 'fr',
  fallbackLng: 'fr',
});

export default i18n;
