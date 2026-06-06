import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Megaphone,
  Users,
  BookOpen,
  Brain,
  BarChart3,
  MessageSquare,
  Calendar,
  Trophy,
  Shield,
  Server,
  Database,
  Cpu,
  Container,
  HardDrive,
  ChevronDown,
  Zap,
  Lock,
  Globe,
  Eye,
  FileText,
  Settings,
  Clock,
  UserCheck,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  ListChecks,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { usePublicAnnouncements, type PublicAnnouncement } from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/public/AnnouncementCard';

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { damping: 30, stiffness: 80 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) count.set(target);
  }, [inView, target, count]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Intersection wrapper for staggered animations                      */
/* ------------------------------------------------------------------ */
function FadeInWhenVisible({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature icon component with glow                                   */
/* ------------------------------------------------------------------ */
function FeatureIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
    >
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} blur-xl opacity-30`}
      />
      <Icon className="relative w-7 h-7 text-white" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Role tab data structure                                            */
/* ------------------------------------------------------------------ */
type RoleData = {
  key: string;
  gradient: string;
  icon: React.ElementType;
  features: string[];
};

const ROLE_ICONS = [Shield, BookOpen, GraduationCap, Users];

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: announcementsData, isLoading } = usePublicAnnouncements({ per_page: 3 });
  const announcements: PublicAnnouncement[] = announcementsData?.items ?? [];
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  /* active role tab */
  const [activeRole, setActiveRole] = useState(0);

  /* screenshot lightbox */
  const [activeScreenshot, setActiveScreenshot] = useState<number | null>(null);

  /* -------------------------------------------------------------- */
  /*  Data                                                           */
  /* -------------------------------------------------------------- */
  const features = [
    {
      icon: Brain,
      titleKey: 'landing.feature_ai_title',
      descKey: 'landing.feature_ai_desc',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: BarChart3,
      titleKey: 'landing.feature_grades_title',
      descKey: 'landing.feature_grades_desc',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: MessageSquare,
      titleKey: 'landing.feature_messages_title',
      descKey: 'landing.feature_messages_desc',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Calendar,
      titleKey: 'landing.feature_schedule_title',
      descKey: 'landing.feature_schedule_desc',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Trophy,
      titleKey: 'landing.feature_quiz_title',
      descKey: 'landing.feature_quiz_desc',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: Shield,
      titleKey: 'landing.feature_security_title',
      descKey: 'landing.feature_security_desc',
      color: 'from-sky-500 to-blue-600',
    },
  ];

  const stats = [
    { value: 1200, suffix: '+', labelKey: 'landing.stats_users', icon: Users, color: 'from-blue-500 to-blue-600' },
    { value: 50000, suffix: '+', labelKey: 'landing.stats_grades', icon: BarChart3, color: 'from-emerald-500 to-emerald-600' },
    { value: 8000, suffix: '+', labelKey: 'landing.stats_quizzes', icon: Trophy, color: 'from-amber-500 to-amber-600' },
    { value: 99, suffix: '%', labelKey: 'landing.stats_uptime', icon: Zap, color: 'from-violet-500 to-violet-600' },
  ];

  const roles: RoleData[] = [
    {
      key: 'role_admin',
      gradient: 'from-violet-600 to-indigo-700',
      icon: ROLE_ICONS[0],
      features: Array.from({ length: 6 }, (_, i) => t(`landing.role_admin_feature_${i + 1}`)),
    },
    {
      key: 'role_teacher',
      gradient: 'from-emerald-600 to-teal-700',
      icon: ROLE_ICONS[1],
      features: Array.from({ length: 6 }, (_, i) => t(`landing.role_teacher_feature_${i + 1}`)),
    },
    {
      key: 'role_student',
      gradient: 'from-blue-600 to-cyan-700',
      icon: ROLE_ICONS[2],
      features: Array.from({ length: 6 }, (_, i) => t(`landing.role_student_feature_${i + 1}`)),
    },
    {
      key: 'role_parent',
      gradient: 'from-amber-600 to-orange-700',
      icon: ROLE_ICONS[3],
      features: Array.from({ length: 4 }, (_, i) => t(`landing.role_parent_feature_${i + 1}`)),
    },
  ];

  const screenshots = [
    { src: 'admin_02_dashboard.png', role: 'role_admin' },
    { src: 'admin_03_users.png', role: 'role_admin' },
    { src: 'teacher_02_dashboard.png', role: 'role_teacher' },
    { src: 'teacher_04_grades.png', role: 'role_teacher' },
    { src: 'student_02_dashboard.png', role: 'role_student' },
    { src: 'student_06_quizzes.png', role: 'role_student' },
    { src: 'student_08_gamification.png', role: 'role_student' },
  ];

  const filteredScreenshots = screenshots.filter((s) => s.role === roles[activeRole].key);

  const securityCards = [
    {
      icon: ShieldCheck,
      titleKey: 'landing.security_auth_title',
      items: Array.from({ length: 4 }, (_, i) => t(`landing.security_auth_${i + 1}`)),
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    {
      icon: Lock,
      titleKey: 'landing.security_enc_title',
      items: Array.from({ length: 4 }, (_, i) => t(`landing.security_enc_${i + 1}`)),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      icon: ShieldAlert,
      titleKey: 'landing.security_audit_title',
      items: Array.from({ length: 4 }, (_, i) => t(`landing.security_audit_${i + 1}`)),
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  ];

  const mobileFeatures = Array.from({ length: 5 }, (_, i) => t(`landing.mobile_feature_${i + 1}`));

  const techStack = [
    { icon: Globe, labelKey: 'landing.tech_react', descKey: 'landing.tech_react_desc', color: 'text-sky-500' },
    { icon: Cpu, labelKey: 'landing.tech_python', descKey: 'landing.tech_python_desc', color: 'text-emerald-500' },
    { icon: Database, labelKey: 'landing.tech_postgres', descKey: 'landing.tech_postgres_desc', color: 'text-blue-500' },
    { icon: Server, labelKey: 'landing.tech_redis', descKey: 'landing.tech_redis_desc', color: 'text-red-500' },
    { icon: Container, labelKey: 'landing.tech_docker', descKey: 'landing.tech_docker_desc', color: 'text-cyan-500' },
    { icon: HardDrive, labelKey: 'landing.tech_minio', descKey: 'landing.tech_minio_desc', color: 'text-orange-500' },
  ];

  /* -------------------------------------------------------------- */
  /*  Render                                                         */
  /* -------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#F4EFE6]">
      <Helmet>
        <title>{t('home.meta_title')}</title>
        <meta name="description" content={t('home.meta_desc')} />
      </Helmet>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative bg-[#2D2A24] text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E\")",
            }}
          />
          <motion.div
            className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(201,100,66,0.15)' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}
            animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div style={{ y: heroParallax }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            {/* Super-label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
              style={{ backgroundColor: 'rgba(201,100,66,0.15)', color: '#c96442', border: '1px solid rgba(201,100,66,0.3)' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('landing.hero_super')}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]"
              style={{ color: '#F4EFE6' }}
            >
              {t('landing.hero_title')}{' '}
              <span className="bg-gradient-to-r from-[#c96442] via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                {t('landing.hero_title_highlight')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl mt-6 max-w-2xl leading-relaxed"
              style={{ color: 'rgba(244,239,230,0.7)' }}
            >
              {t('landing.hero_subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-start gap-4 mt-10"
            >
              <Link
                to="/annonces"
                className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#c96442' }}
              >
                {t('landing.hero_cta_explore')}
                <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:scale-105"
                style={{ border: '1px solid rgba(244,239,230,0.2)', color: '#F4EFE6' }}
              >
                {t('landing.hero_cta_demo')}
                <Lock className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
            >
              {[
                { value: '99%', label: 'Disponibilité' },
                { value: '< 3s', label: 'Réponse IA' },
                { value: '1200+', label: 'Utilisateurs' },
                { value: '100%', label: 'Open source' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#F4EFE6' }}>
                    {s.value}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(244,239,230,0.5)' }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-sm mb-2" style={{ color: 'rgba(244,239,230,0.4)' }}>
              {t('landing.hero_scroll')}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6" style={{ color: 'rgba(244,239,230,0.3)' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  KPI FLOATING BAR                                            */}
      {/* ============================================================ */}
      <section className="relative -mt-14 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4 rounded-2xl p-8 shadow-2xl sm:grid-cols-4"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
        >
          {[
            { value: '100%', label: 'Données sur site', sub: 'Zéro cloud externe' },
            { value: '< 300ms', label: 'Latence IA', sub: 'Ollama en local' },
            { value: 'AES-256', label: 'Chiffrement', sub: 'Messages & données' },
            { value: '4', label: 'Profils', sub: 'Admin, Enseignant, Élève, Parent' },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-2"
            >
              <div className="text-3xl font-extrabold" style={{ color: '#c96442' }}>
                {k.value}
              </div>
              <div className="mt-1 font-semibold text-gray-800">{k.label}</div>
              <div className="text-sm text-gray-500">{k.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.features_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('landing.features_title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.features_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeInWhenVisible key={feature.titleKey} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300"
                  style={{ border: `1px solid rgba(201,100,66,0.1)` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#c96442] to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FeatureIcon icon={feature.icon} color={feature.color} />
                  <h3 className="text-xl font-bold text-gray-900 mt-5 mb-3">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ROLE-BASED FEATURES                                         */}
      {/* ============================================================ */}
      <section className="py-24" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.roles_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('landing.roles_title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.roles_desc')}
            </p>
          </FadeInWhenVisible>

          {/* Role Tabs */}
          <div className="flex justify-center gap-2 flex-wrap mb-10">
            {roles.map((r, i) => (
              <motion.button
                key={r.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveRole(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  activeRole === i
                    ? `bg-gradient-to-r ${r.gradient} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                style={activeRole !== i ? { backgroundColor: 'rgba(201,100,66,0.08)' } : {}}
              >
                {t(r.key)}
              </motion.button>
            ))}
          </div>

          {/* Role Features Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {roles[activeRole].features.map((feat, i) => (
                <motion.div
                  key={feat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="rounded-xl p-6 transition-all cursor-default"
                  style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(201,100,66,0.1)' }}>
                    {(() => {
                      const icons = [Settings, Eye, FileText, Clock, ListChecks, UserCheck];
                      const Icon = icons[i % icons.length];
                      return <Icon className="w-5 h-5" style={{ color: '#c96442' }} />;
                    })()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{feat}</h3>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS                                                       */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#2D2A24] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c96442]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c96442]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.stats_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('landing.stats_title')}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(244,239,230,0.6)' }}>
              {t('landing.stats_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeInWhenVisible key={stat.labelKey} delay={i * 0.1}>
                <div className="text-center group">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{ color: 'rgba(244,239,230,0.6)' }} className="font-medium">
                    {t(stat.labelKey)}
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SCREENSHOTS GALLERY                                         */}
      {/* ============================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.screenshots_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('landing.screenshots_title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.screenshots_desc')}
            </p>
          </FadeInWhenVisible>

          {/* Screenshot role filter */}
          <div className="flex justify-center gap-2 flex-wrap mb-10">
            {roles.map((r, i) => (
              <button
                key={r.key}
                onClick={() => setActiveRole(i)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeRole === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(r.key)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {filteredScreenshots.map((s, i) => (
                <motion.div
                  key={s.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group shadow-md"
                  onClick={() => setActiveScreenshot(i)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveScreenshot(i)}
                  tabIndex={0}
                  role="button"
                >
                  <img
                    src={`https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/${s.src}`}
                    alt={s.src.replace('.png', '').replace(/_/g, ' ')}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-xs font-medium">
                      {s.src.replace('.png', '').replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Full-screen lightbox */}
          <AnimatePresence>
            {activeScreenshot !== null && filteredScreenshots[activeScreenshot] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
                onClick={() => setActiveScreenshot(null)}
                onKeyDown={(e) => e.key === 'Escape' && setActiveScreenshot(null)}
                tabIndex={-1}
              >
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  src={`https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/${filteredScreenshots[activeScreenshot].src}`}
                  className="max-w-full max-h-full rounded-2xl shadow-2xl"
                  alt="Screenshot"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECURITY & COMPLIANCE                                       */}
      {/* ============================================================ */}
      <section className="py-24" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.security_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('landing.security_title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.security_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid gap-6 sm:grid-cols-3">
            {securityCards.map((card, i) => (
              <FadeInWhenVisible key={card.titleKey} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl p-6 shadow-sm border ${card.borderColor} ${card.bgColor} transition-all`}
                >
                  <card.icon className={`w-8 h-8 ${card.color} mb-3`} />
                  <h3 className="text-lg font-bold text-gray-900">{t(card.titleKey)}</h3>
                  <ul className="mt-4 space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${card.color.replace('text-', 'bg-')}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MOBILE SHOWCASE                                             */}
      {/* ============================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeInWhenVisible>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
                style={{ backgroundColor: 'rgba(201,100,66,0.1)', color: '#c96442' }}
              >
                <Smartphone className="w-4 h-4" />
                {t('landing.mobile_super')}
              </span>
              <h2 className="text-4xl font-bold text-gray-900">{t('landing.mobile_title')}</h2>
              <p className="mt-4 text-lg text-gray-500">{t('landing.mobile_desc')}</p>
              <ul className="mt-8 space-y-4">
                {mobileFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(201,100,66,0.1)' }}>
                      <Zap className="w-3 h-3" style={{ color: '#c96442' }} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://github.com/HiTechTN/don-bosco-connect/releases"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#c96442' }}
              >
                <Smartphone className="w-4 h-4" />
                {t('landing.mobile_download')}
              </a>
            </FadeInWhenVisible>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              {/* Phone mockup */}
              <div
                className="relative w-64 h-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden"
                style={{ border: '4px solid #2D2A24' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-xl" style={{ backgroundColor: '#2D2A24' }} />
                <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🎓</div>
                    <div className="text-xl font-bold text-white">Don Bosco</div>
                    <div className="text-sm" style={{ color: '#c96442' }}>Connect</div>
                    <div className="mt-6 space-y-3">
                      {['Dashboard', 'Notes', 'Absences', 'Quiz', 'IA Chat'].map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c96442' }} />
                          <span className="text-white text-sm">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  LATEST ANNOUNCEMENTS                                        */}
      {/* ============================================================ */}
      <section className="py-24" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('home.announcements_title')}
              </h2>
              <p className="text-gray-500 text-lg">{t('home.announcements_desc')}</p>
            </div>
            <Link
              to="/annonces"
              className="hidden sm:inline-flex items-center gap-2 font-semibold transition-colors"
              style={{ color: '#c96442' }}
            >
              <Megaphone className="w-5 h-5" />
              {t('home.view_all')}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </FadeInWhenVisible>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <AnnouncementCard {...ann} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">{t('home.no_announcements')}</p>
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 font-semibold transition-colors"
              style={{ color: '#c96442' }}
            >
              {t('home.view_all')}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TECH STACK                                                  */}
      {/* ============================================================ */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.tech_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('landing.tech_title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.tech_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map((tech, i) => (
              <FadeInWhenVisible key={tech.labelKey} delay={i * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                >
                  <tech.icon className={`w-8 h-8 ${tech.color} mb-3`} />
                  <h4 className="font-bold text-gray-900 text-sm">{t(tech.labelKey)}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t(tech.descKey)}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DEMO ACCOUNTS                                               */}
      {/* ============================================================ */}
      <section className="py-16" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <motion.div
              className="rounded-2xl p-8 shadow-lg"
              style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
            >
              <h3 className="text-xl font-bold text-center text-gray-900 mb-6">
                🚀 {t('landing.demo_title')}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { roleKey: 'landing.demo_admin_label', email: 'admin@donbosco.tn', color: '#7C3AED' },
                  { roleKey: 'landing.demo_teacher_label', email: 'karim.hamdi@donbosco.tn', color: '#059669' },
                  { roleKey: 'landing.demo_student_label', email: 'adam.slim@donbosco.tn', color: '#D97706' },
                  { roleKey: 'landing.demo_parent_label', email: 'ahmed.slim@parent.tn', color: '#DC2626' },
                ].map((a) => (
                  <motion.div
                    key={a.roleKey}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    className="rounded-xl p-4 text-center cursor-default transition-all"
                    style={{ border: `1px solid ${a.color}20`, backgroundColor: `${a.color}08` }}
                  >
                    <div className="text-sm font-bold" style={{ color: a.color }}>
                      {t(a.roleKey)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{a.email}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: '#c96442' }}
                >
                  {t('landing.hero_cta_demo')} →
                </Link>
              </div>
            </motion.div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#2D2A24] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c96442]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#c96442]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInWhenVisible>
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#c96442' }}>
              {t('landing.cta_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#F4EFE6' }}>
              {t('landing.cta_title')}
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(244,239,230,0.6)' }}>
              {t('landing.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 rounded-xl px-10 py-5 text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                style={{ backgroundColor: '#c96442', color: '#fff' }}
              >
                {t('landing.cta_button')}
                <ArrowRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Link>
              <a
                href="https://github.com/HiTechTN/don-bosco-connect"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-5 text-sm font-semibold transition-all hover:scale-105"
                style={{ border: '1px solid rgba(244,239,230,0.2)', color: '#F4EFE6' }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

    </div>
  );
}
