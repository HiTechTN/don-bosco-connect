import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from '../i18n/fr.json';
import ar from '../i18n/ar.json';

const savedLng = localStorage.getItem('language');
const defaultLng = savedLng === 'ar' ? 'ar' : 'fr';

// Apply dir/lang before React renders to avoid FOUC
if (defaultLng === 'ar') {
  document.documentElement.dir = 'rtl';
}
document.documentElement.lang = defaultLng;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar }
  },
  lng: defaultLng,
  fallbackLng: 'fr',
});

export default i18n;
