import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const ROLES = [
  {
    role: 'Admin',
    gradient: 'from-violet-600 to-indigo-700',
    icon: '🛡️',
    pages: [
      { icon: '📊', title: 'Dashboard', desc: 'Vue globale : stats, alertes décrochage, activité en temps réel' },
      { icon: '👥', title: 'Gestion utilisateurs', desc: 'CRUD complet : enseignants, élèves, parents' },
      { icon: '🏫', title: 'Classes & inscriptions', desc: 'Années scolaires, sections, inscriptions' },
      { icon: '📈', title: 'Analytics', desc: 'Rapports par matière, classe, période. Export PDF/CSV' },
      { icon: '📅', title: 'Emploi du temps', desc: 'Grille périodique, création/édition de créneaux' },
      { icon: '📋', title: 'Audit & logs', desc: 'Traçabilité complète de toutes les actions' },
      { icon: '🎉', title: 'Événements', desc: 'CRUD calendrier scolaire, types, rappels' },
    ],
  },
  {
    role: 'Enseignant',
    gradient: 'from-emerald-600 to-teal-700',
    icon: '👨‍🏫',
    pages: [
      { icon: '📚', title: 'Dépôt de cours', desc: 'Upload PDF, DOCX, vidéo. Indexation IA automatique' },
      { icon: '📝', title: 'Carnet de notes', desc: 'Saisie bulk, calcul automatique, publication en 1 clic' },
      { icon: '🚫', title: 'Absences', desc: 'Saisie rapide, notification parent < 5 minutes' },
      { icon: '🤖', title: 'Assistant IA', desc: 'Génération de quiz, réponses basées sur les cours' },
      { icon: '💬', title: 'Messagerie', desc: 'Messages chiffrés avec parents et administration' },
    ],
  },
  {
    role: 'Élève',
    gradient: 'from-blue-600 to-cyan-700',
    icon: '🧑‍🎓',
    pages: [
      { icon: '🤖', title: 'Mentor IA 24/7', desc: 'Pose une question, reçois une réponse basée sur ton cours' },
      { icon: '🎯', title: 'Quiz adaptatif', desc: 'La difficulté s\'adapte à ton niveau en temps réel' },
      { icon: '🎮', title: 'Gamification', desc: 'XP, badges, streaks, classement bienveillant' },
      { icon: '📊', title: 'Mes notes', desc: 'Bulletins, moyennes, évolution dans le temps' },
      { icon: '📅', title: 'Emploi du temps', desc: 'Toutes tes séances en un coup d\'œil' },
      { icon: '🏆', title: 'Classement', desc: 'Leaderboard gamifié avec récompenses' },
    ],
  },
  {
    role: 'Parent',
    gradient: 'from-amber-600 to-orange-700',
    icon: '👪',
    pages: [
      { icon: '📊', title: 'Suivi en temps réel', desc: 'Notes, absences, emploi du temps de votre enfant' },
      { icon: '🚫', title: 'Justification absences', desc: 'Justifiez en ligne depuis l\'app mobile' },
      { icon: '💬', title: 'Messagerie', desc: 'Contact direct avec les enseignants' },
      { icon: '📅', title: 'Calendrier', desc: 'Examens, réunions, événements scolaires' },
    ],
  },
];

const TECH_STACK = [
  { category: 'Backend', items: ['FastAPI', 'SQLAlchemy 2.0', 'Celery', 'Redis'], color: 'from-blue-500 to-blue-600' },
  { category: 'Base de données', items: ['PostgreSQL 16', 'pgvector', 'Alembic'], color: 'from-indigo-500 to-indigo-600' },
  { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind', 'shadcn/ui'], color: 'from-emerald-500 to-emerald-600' },
  { category: 'IA Locale', items: ['Ollama', 'DeepSeek 14B', 'RAG', 'nomic-embed'], color: 'from-violet-500 to-violet-600' },
  { category: 'Infrastructure', items: ['Docker', 'Nginx', 'MinIO', 'Prometheus'], color: 'from-slate-500 to-slate-600' },
  { category: 'Mobile', items: ['React Native', 'Expo', 'Push notifications'], color: 'from-rose-500 to-rose-600' },
];

const SCREENSHOTS = [
  { src: 'admin_02_dashboard.png', label: 'Admin Dashboard', role: 'Admin' },
  { src: 'admin_03_users.png', label: 'Gestion utilisateurs', role: 'Admin' },
  { src: 'admin_04_classes.png', label: 'Classes', role: 'Admin' },
  { src: 'teacher_02_dashboard.png', label: 'Teacher Dashboard', role: 'Enseignant' },
  { src: 'teacher_04_grades.png', label: 'Notes', role: 'Enseignant' },
  { src: 'student_02_dashboard.png', label: 'Student Dashboard', role: 'Élève' },
  { src: 'student_06_quizzes.png', label: 'Quiz adaptatif', role: 'Élève' },
  { src: 'student_08_gamification.png', label: 'Gamification', role: 'Élève' },
];

const FADE_UP = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
};

export default function LandingDemo() {
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [activeScreenshot, setActiveScreenshot] = useState<number | null>(null);
  const [counts, setCounts] = useState({ users: 0, classes: 0, subjects: 0, events: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const target = { users: 500, classes: 30, subjects: 15, events: 50 };
    let start = 0;
    const animate = () => {
      start += 2;
      setCounts({
        users: Math.min(Math.floor(start * 2.5), target.users),
        classes: Math.min(Math.floor(start * 0.15), target.classes),
        subjects: Math.min(Math.floor(start * 0.075), target.subjects),
        events: Math.min(Math.floor(start * 0.25), target.events),
      });
      if (start < 200) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const filteredScreenshots = SCREENSHOTS.filter(s => s.role === ROLES[activeRole].role);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4EFE6' }}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/90 shadow-lg backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            <span className="bg-gradient-to-r from-[#c96442] to-amber-500 bg-clip-text text-transparent">✦</span>{' '}
            Don Bosco <span className="font-light">Connect</span>
          </span>
          <div className="flex items-center gap-6">
            {['features', 'screenshots', 'architecture', 'mobile'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`text-sm font-medium transition-all hover:scale-105 ${
                  scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {id === 'features' ? 'Fonctionnalités' : id === 'screenshots' ? 'Aperçu' : id === 'architecture' ? 'Tech' : 'Mobile'}
              </a>
            ))}
            <a
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: scrolled ? '#c96442' : 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              Connexion
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundColor: '#2D2A24' }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(201,100,66,0.15)' }} />
          <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
              style={{ backgroundColor: 'rgba(201,100,66,0.15)', color: '#c96442', border: '1px solid rgba(201,100,66,0.3)' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              100% on-premise · IA locale · Open source
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight"
              style={{ color: '#F4EFE6' }}
            >
              L'IA au service<br />
              <span className="bg-gradient-to-r from-[#c96442] via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                de l'éducation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-lg leading-relaxed max-w-2xl"
              style={{ color: 'rgba(244,239,230,0.7)' }}
            >
              Don Bosco Connect modernise la gestion scolaire avec une plateforme <strong style={{ color: '#F4EFE6' }}>100% on-premise</strong>,
              intelligente et sécurisée. Conçue pour le Collège Don Bosco Tunis — aucune donnée ne quitte le réseau de l'école.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#c96442' }}
              >
                Découvrir la plateforme
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:scale-105"
                style={{ border: '1px solid rgba(244,239,230,0.2)', color: '#F4EFE6' }}
              >
                Accéder à la plateforme
              </a>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
            >
              {[
                { value: '99%', label: 'Disponibilité' },
                { value: '< 3s', label: 'Réponse IA' },
                { value: `${counts.users}+`, label: 'Utilisateurs' },
                { value: '100%', label: 'Open source' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#F4EFE6' }}>{s.value}</div>
                  <div className="text-sm" style={{ color: 'rgba(244,239,230,0.5)' }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* KPI Cards */}
      <section className="relative -mt-16 mx-auto max-w-6xl px-6 z-10">
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
              <div className="text-3xl font-extrabold" style={{ color: '#c96442' }}>{k.value}</div>
              <div className="mt-1 font-semibold text-gray-800">{k.label}</div>
              <div className="text-sm text-gray-500">{k.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features by Role */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...FADE_UP} className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">4 profils, une plateforme unifiée</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Chaque utilisateur dispose d'une interface adaptée à son rôle avec les outils dont il a besoin.
            </p>
          </motion.div>

          {/* Role Tabs */}
          <div className="mt-12 flex justify-center gap-2 flex-wrap">
            {ROLES.map((r, i) => (
              <motion.button
                key={r.role}
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
                {r.icon} {r.role}
              </motion.button>
            ))}
          </div>

          {/* Features Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {ROLES[activeRole].pages.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="group rounded-xl p-6 transition-all cursor-default"
                  style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
                >
                  <div className="text-3xl">{p.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B7280' }}>{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section id="screenshots" className="py-24" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...FADE_UP} className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Aperçu de la plateforme</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Interface moderne, responsive, adaptée à chaque profil.
            </p>
          </motion.div>

          {/* Screenshot role filter */}
          <div className="mt-10 flex justify-center gap-2 flex-wrap">
            {ROLES.map((r, i) => (
              <button
                key={r.role}
                onClick={() => setActiveRole(i)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeRole === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.role}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
                >
                  <img
                    src={`https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/${s.src}`}
                    alt={s.label}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-xs font-medium">{s.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Full-screen modal */}
          <AnimatePresence>
            {activeScreenshot !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
                onClick={() => setActiveScreenshot(null)}
              >
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  src={`https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/${filteredScreenshots[activeScreenshot]?.src}`}
                  className="max-w-full max-h-full rounded-2xl shadow-2xl"
                  alt="Screenshot"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Demo Video */}
      <section className="py-24" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div {...FADE_UP}>
            <h2 className="text-4xl font-bold text-gray-900">Vidéo de démonstration</h2>
            <p className="mt-4 text-lg text-gray-500">3 minutes pour découvrir toutes les fonctionnalités</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <video
              src="https://github.com/HiTechTN/don-bosco-connect/raw/main/demo/demo_don_bosco.mp4"
              controls
              width="100%"
              poster={`https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/00_landing.png`}
              className="w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Mobile App Showcase */}
      <section id="mobile" className="py-24" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...FADE_UP}>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(201,100,66,0.1)', color: '#c96442' }}>
                📱 Application mobile
              </span>
              <h2 className="text-4xl font-bold text-gray-900">Don Bosco Connect Mobile</h2>
              <p className="mt-4 text-lg text-gray-500">
                L'application mobile React Native / Expo avec toutes les fonctionnalités de la plateforme.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: '🚀', text: 'Notifications push en temps réel' },
                  { icon: '📷', text: 'Scan de QR code pour pointage' },
                  { icon: '📱', text: 'iOS & Android (Expo)' },
                  { icon: '🔒', text: 'Biométrie (Touch ID / Face ID)' },
                  { icon: '📴', text: 'Mode hors-ligne pour les notes' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-gray-700">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
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
                📥 Télécharger l'APK
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="relative w-64 h-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden" style={{ border: '4px solid #2D2A24' }}>
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

      {/* Architecture */}
      <section id="architecture" className="py-24" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...FADE_UP} className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Architecture technique</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Stack 100% open source, conteneurisée, conçue pour un déploiement sur site.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl p-8 shadow-lg"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
          >
            <div className="flex flex-col items-center">
              {/* Clients */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 mb-6"
              >
                {['🌐 Web', '📱 iOS', '🤖 Android'].map((c) => (
                  <motion.div
                    key={c}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-xl px-5 py-3 text-sm font-medium"
                    style={{ backgroundColor: 'rgba(201,100,66,0.08)', border: '1px solid rgba(201,100,66,0.2)', color: '#c96442' }}
                  >
                    {c}
                  </motion.div>
                ))}
              </motion.div>
              <svg className="w-6 h-6 mb-4" style={{ color: '#c96442' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Nginx */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-xl px-8 py-3 text-sm font-semibold mb-4"
                style={{ backgroundColor: 'rgba(201,100,66,0.1)', border: '1px solid rgba(201,100,66,0.2)', color: '#c96442' }}
              >
                🔒 Nginx (TLS 1.3, Rate Limiting)
              </motion.div>
              <svg className="w-6 h-6 mb-4" style={{ color: '#c96442' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Services grid */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-3xl mb-4">
                {[
                  { icon: '⚡', title: 'FastAPI', sub: 'API REST + WS', color: '#c96442' },
                  { icon: '🔄', title: 'Celery', sub: 'Tâches async', color: '#7C3AED' },
                  { icon: '📁', title: 'MinIO', sub: 'Stockage S3', color: '#0891B2' },
                ].map((s) => (
                  <motion.div
                    key={s.title}
                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                    className="rounded-xl p-4 text-center cursor-default transition-all"
                    style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}
                  >
                    <div className="text-lg mb-1">{s.icon}</div>
                    <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{s.title}</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>{s.sub}</div>
                  </motion.div>
                ))}
              </div>
              <svg className="w-6 h-6 mb-4" style={{ color: '#c96442' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Data layer */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-4">
                {[
                  { icon: '🗄️', title: 'PostgreSQL 16 + pgvector', sub: 'Données + embeddings', color: '#DC2626' },
                  { icon: '⚡', title: 'Redis 7', sub: 'Cache + Queue', color: '#EA580C' },
                ].map((d) => (
                  <motion.div
                    key={d.title}
                    whileHover={{ y: -4 }}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: `${d.color}08`, border: `1px solid ${d.color}20` }}
                  >
                    <div className="text-lg mb-1">{d.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{d.title}</div>
                    <div className="text-xs text-gray-500">{d.sub}</div>
                  </motion.div>
                ))}
              </div>
              <svg className="w-6 h-6 mb-4" style={{ color: '#c96442' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Ollama */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-xl px-8 py-3 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#7C3AED' }}
              >
                🧠 Ollama (DeepSeek R1 14B + nomic-embed-text)
              </motion.div>
            </div>
          </motion.div>

          {/* Stack grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((col) => (
              <motion.div
                key={col.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}
              >
                <h3 className="font-bold text-gray-900">{col.category}</h3>
                <ul className="mt-4 space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#c96442' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="py-24" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...FADE_UP} className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Sécurité & Conformité</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Conçue pour protéger les données des mineurs. Aucune information ne quitte le réseau de l'école.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🔐', title: 'Authentification forte',
                items: ['JWT 15 min / Refresh 7 jours', 'MFA TOTP obligatoire (admin/enseignant)', 'Blocage après 5 échecs', 'Hash bcrypt cost 12'],
                color: '#c96442',
              },
              {
                icon: '🔒', title: 'Chiffrement E2E',
                items: ['Messages AES-256-GCM', 'TLS 1.3 partout', 'Stockage objet signé (URLs présignées)', 'Base de données isolée'],
                color: '#059669',
              },
              {
                icon: '📋', title: 'Traçabilité complète',
                items: ['Audit logs de toutes les actions', 'Logs pseudonymisés (RGPD)', 'Backup quotidien (30 jours)', 'Monitoring Prometheus / Grafana'],
                color: '#6366F1',
              },
            ].map((s) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="rounded-xl p-6 shadow-sm transition-all"
                style={{ backgroundColor: '#fff', border: `1px solid ${s.color}20` }}
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <ul className="mt-4 space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="py-16" style={{ backgroundColor: '#F4EFE6' }}>
        <div className="mx-auto max-w-4xl px-6">
          <motion.div {...FADE_UP} className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: '#fff', border: '1px solid rgba(201,100,66,0.1)' }}>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">🚀 Comptes de démonstration</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { role: 'Admin', email: 'admin@donbosco.tn', password: 'admin123!', color: '#7C3AED' },
                { role: 'Enseignant', email: 'karim.hamdi@donbosco.tn', password: 'teacher123!', color: '#059669' },
                { role: 'Élève', email: 'adam.slim@donbosco.tn', password: 'student123!', color: '#D97706' },
                { role: 'Parent', email: 'ahmed.slim@parent.tn', password: 'parent123!', color: '#DC2626' },
              ].map((a) => (
                <motion.div
                  key={a.role}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  className="rounded-xl p-4 text-center cursor-default transition-all"
                  style={{ border: `1px solid ${a.color}20`, backgroundColor: `${a.color}08` }}
                >
                  <div className="text-sm font-bold" style={{ color: a.color }}>{a.role}</div>
                  <div className="mt-1 text-xs text-gray-500">{a.email}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#9CA3AF' }}>{a.password}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#c96442' }}
              >
                Accéder à la plateforme →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ backgroundColor: '#2D2A24' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div {...FADE_UP}>
            <h2 className="text-4xl font-bold" style={{ color: '#F4EFE6' }}>Prêt à moderniser votre établissement ?</h2>
            <p className="mt-4 text-lg" style={{ color: 'rgba(244,239,230,0.7)' }}>
              Don Bosco Connect est prêt pour un déploiement sur site. Stack 100% open source, zéro licence, zéro cloud.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center gap-4 flex-wrap"
          >
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#c96442' }}
            >
              Accéder à la plateforme
            </a>
            <a
              href="https://github.com/HiTechTN/don-bosco-connect"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:scale-105"
              style={{ border: '1px solid rgba(244,239,230,0.2)', color: '#F4EFE6' }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              Code source (GitHub)
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1C1A16', color: 'rgba(244,239,230,0.6)' }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="font-bold" style={{ color: '#F4EFE6' }}>Don Bosco Connect</h4>
              <p className="mt-2 text-sm">Plateforme éducative intelligente pour le Collège Don Bosco Tunis.</p>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: '#F4EFE6' }}>Technologies</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>FastAPI + React + React Native</li>
                <li>PostgreSQL 16 + pgvector</li>
                <li>Ollama + DeepSeek R1</li>
                <li>Docker + Nginx + MinIO</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: '#F4EFE6' }}>Contact</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Collège Don Bosco Tunis</li>
                <li>Réalisé par HiTech TN</li>
                <li>
                  <a href="https://github.com/HiTechTN/don-bosco-connect" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: '1px solid rgba(244,239,230,0.1)' }}>
            &copy; {new Date().getFullYear()} Collège Don Bosco Tunis — Don Bosco Connect. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
