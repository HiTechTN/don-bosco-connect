import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const en = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
  },
  nav: {
    dashboard: "Dashboard",
    courses: "Courses",
    assignments: "Assignments",
    ai: "AI",
    logout: "Logout",
  },
  auth: {
    login: "Login",
    username: "Username",
    password: "Password",
    loginButton: "Sign In",
  },
  dashboard: {
    welcome: "Welcome",
    xpPoints: "XP",
    level: "Level",
    progress: "Progress",
  },
  courses: {
    title: "Courses",
    description: "Description",
    lessons: "Lessons",
  },
};

const fr = {
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    save: "Enregistrer",
    cancel: "Annuler",
  },
  nav: {
    dashboard: "Tableau de bord",
    courses: "Cours",
    assignments: "Devoirs",
    ai: "IA",
    logout: "Déconnexion",
  },
  auth: {
    login: "Connexion",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    loginButton: "Se connecter",
  },
  dashboard: {
    welcome: "Bienvenue",
    xpPoints: "XP",
    level: "Niveau",
    progress: "Progrès",
  },
  courses: {
    title: "Cours",
    description: "Description",
    lessons: "Leçons",
  },
};

const ar = {
  common: {
    loading: "جار التحميل...",
    error: "خطأ",
    success: "نجاح",
    save: "حفظ",
    cancel: "إلغاء",
  },
  nav: {
    dashboard: "لوحة التحكم",
    courses: "الدروس",
    assignments: "الواجبات",
    ai: "ذكاء",
    logout: "تسجيل الخروج",
  },
  auth: {
    login: "دخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginButton: "دخول",
  },
  dashboard: {
    welcome: "مرحبا",
    xpPoints: "نقاط",
    level: "المستوى",
    progress: "التقدم",
  },
  courses: {
    title: "الدروس",
    description: "الوصف",
    lessons: "الدروس",
  },
};

export const i18n = new I18n({
  en,
  fr,
  ar,
});

i18n.locale = Localization.locale.split('-')[0] || 'fr';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;