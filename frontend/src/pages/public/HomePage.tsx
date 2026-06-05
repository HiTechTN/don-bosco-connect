import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
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
  Sparkles,
  Zap,
  Lock,
  Globe,
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
    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} blur-xl opacity-30`} />
      <Icon className="relative w-7 h-7 text-white" />
    </div>
  );
}

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

  const demoAccounts = [
    { role: 'admin', icon: Shield, color: 'from-red-500 to-rose-600', labelKey: 'landing.demo_admin_label', descKey: 'landing.demo_admin_desc' },
    { role: 'enseignant', icon: BookOpen, color: 'from-blue-500 to-blue-600', labelKey: 'landing.demo_teacher_label', descKey: 'landing.demo_teacher_desc' },
    { role: 'élève', icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', labelKey: 'landing.demo_student_label', descKey: 'landing.demo_student_desc' },
    { role: 'parent', icon: Users, color: 'from-amber-500 to-amber-600', labelKey: 'landing.demo_parent_label', descKey: 'landing.demo_parent_desc' },
  ];

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
    <div className="min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('home.meta_title')}</title>
        <meta name="description" content={t('home.meta_desc')} />
      </Helmet>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-[#0D2B3E] via-[#1B4F72] to-[#154360] text-white overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#F39C12]/10 rounded-full blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[#F39C12]/8 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <motion.div style={{ y: heroParallax }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Super-label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#F39C12]" />
              <span className="text-sm font-medium text-white/90">{t('landing.hero_super')}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]"
            >
              {t('landing.hero_title')}{' '}
              <span className="bg-gradient-to-r from-[#F39C12] via-[#F1C40F] to-[#E67E22] bg-clip-text text-transparent">
                {t('landing.hero_title_highlight')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t('landing.hero_subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/annonces"
                className="group inline-flex items-center gap-2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#F39C12]/25 hover:shadow-xl hover:shadow-[#F39C12]/30 hover:-translate-y-0.5"
              >
                {t('landing.hero_cta_explore')}
                <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('landing.hero_cta_demo')}
                <Lock className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center mt-20"
          >
            <span className="text-sm text-white/40 mb-2">{t('landing.hero_scroll')}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#F39C12] uppercase tracking-wider mb-3">
              {t('landing.features_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E293B] mb-4">
              {t('landing.features_title')}
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              {t('landing.features_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeInWhenVisible key={feature.titleKey} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] hover:shadow-xl hover:border-[#F39C12]/30 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))' }}
                  />
                  <FeatureIcon icon={feature.icon} color={feature.color} />
                  <h3 className="text-xl font-bold text-[#1E293B] mt-5 mb-3">{t(feature.titleKey)}</h3>
                  <p className="text-[#64748B] leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS                                                       */}
      {/* ============================================================ */}
      <section className="py-24 bg-gradient-to-br from-[#0D2B3E] via-[#1B4F72] to-[#154360] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F39C12]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F39C12]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#F39C12] uppercase tracking-wider mb-3">
              {t('landing.stats_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('landing.stats_title')}
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t('landing.stats_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeInWhenVisible key={stat.labelKey} delay={i * 0.1}>
                <div className="text-center group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-white/60 font-medium">{t(stat.labelKey)}</div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DEMO ACCOUNTS                                               */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#F39C12] uppercase tracking-wider mb-3">
              {t('landing.demo_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E293B] mb-4">
              {t('landing.demo_title')}
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              {t('landing.demo_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoAccounts.map((account, i) => (
              <FadeInWhenVisible key={account.role} delay={i * 0.1}>
                <Link to="/login">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                    className="group relative bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] hover:shadow-xl hover:border-[#F39C12]/30 transition-all duration-300 cursor-pointer text-center"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${account.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <account.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E293B] mb-2">{t(account.labelKey)}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-4">{t(account.descKey)}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#F39C12] group-hover:gap-2 transition-all">
                      {t('landing.hero_cta_demo')}
                      <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                    </span>
                  </motion.div>
                </Link>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  LATEST ANNOUNCEMENTS                                        */}
      {/* ============================================================ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
                {t('home.announcements_title')}
              </h2>
              <p className="text-[#64748B] text-lg">
                {t('home.announcements_desc')}
              </p>
            </div>
            <Link
              to="/annonces"
              className="hidden sm:inline-flex items-center gap-2 text-[#1B4F72] hover:text-[#F39C12] font-semibold transition-colors"
            >
              <Megaphone className="w-5 h-5" />
              {t('home.view_all')}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </FadeInWhenVisible>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
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
            <div className="text-center py-16 text-[#64748B]">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">{t('home.no_announcements')}</p>
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 text-[#1B4F72] hover:text-[#F39C12] font-semibold transition-colors"
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
      <section className="py-24 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[#F39C12] uppercase tracking-wider mb-3">
              {t('landing.tech_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E293B] mb-4">
              {t('landing.tech_title')}
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              {t('landing.tech_desc')}
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map((tech, i) => (
              <FadeInWhenVisible key={tech.labelKey} delay={i * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#F39C12]/30 hover:shadow-lg transition-all duration-300"
                >
                  <tech.icon className={`w-8 h-8 ${tech.color} mb-3`} />
                  <h4 className="font-bold text-[#1E293B] text-sm">{t(tech.labelKey)}</h4>
                  <p className="text-xs text-[#64748B] mt-1">{t(tech.descKey)}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="py-24 bg-gradient-to-br from-[#0D2B3E] via-[#1B4F72] to-[#154360] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F39C12]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F39C12]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInWhenVisible>
            <span className="inline-block text-sm font-semibold text-[#F39C12] uppercase tracking-wider mb-3">
              {t('landing.cta_super')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t('landing.cta_title')}
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              {t('landing.cta_desc')}
            </p>
            <Link
              to="/login"
              className="group inline-flex items-center gap-3 bg-[#F39C12] hover:bg-[#E67E22] text-white font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 shadow-lg shadow-[#F39C12]/25 hover:shadow-xl hover:shadow-[#F39C12]/30 hover:-translate-y-1"
            >
              {t('landing.cta_button')}
              <ArrowRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
