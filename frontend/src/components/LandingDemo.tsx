import { useState, useEffect, useRef } from 'react';

const ROLES = [
  {
    role: 'Admin',
    color: 'from-violet-600 to-indigo-700',
    pages: [
      { icon: '📊', title: 'Dashboard', desc: 'Vue globale : stats, alertes décrochage, activité en temps réel' },
      { icon: '👥', title: 'Gestion utilisateurs', desc: 'CRUD complet : enseignants, élèves, parents. Import CSV' },
      { icon: '🏫', title: 'Classes & inscriptions', desc: 'Années scolaires, sections, inscriptions, emplois du temps' },
      { icon: '📈', title: 'Analytics', desc: 'Rapports par matière, classe, période. Export PDF/CSV' },
      { icon: '📋', title: 'Audit logs', desc: 'Traçabilité complète de toutes les actions' },
    ],
  },
  {
    role: 'Enseignant',
    color: 'from-emerald-600 to-teal-700',
    pages: [
      { icon: '📚', title: 'Dépôt de cours', desc: 'Upload PDF, DOCX, vidéo. Indexation IA automatique' },
      { icon: '📝', title: 'Carnet de notes', desc: 'Saisie bulk, calcul automatique, publication en 1 clic' },
      { icon: '🚫', title: 'Absences', desc: 'Saisie rapide, notification parent < 5 minutes' },
      { icon: '🤖', title: 'Assistant IA', desc: 'Génération de quiz automatique depuis le cours' },
      { icon: '💬', title: 'Messagerie', desc: 'Messages chiffrés avec parents et administration' },
    ],
  },
  {
    role: 'Élève',
    color: 'from-blue-600 to-cyan-700',
    pages: [
      { icon: '🤖', title: 'Mentor IA 24/7', desc: 'Pose une question, reçois une réponse basée sur ton cours' },
      { icon: '🎯', title: 'Quiz adaptatif', desc: 'La difficulté s\'adapte à ton niveau en temps réel' },
      { icon: '🎮', title: 'Gamification', desc: 'Gagne de l\'XP, débloque des badges, monte dans le classement' },
      { icon: '📊', title: 'Mes notes', desc: 'Bulletins, moyennes, évolution dans le temps' },
      { icon: '📅', title: 'Emploi du temps', desc: 'Toutes tes séances en un coup d\'œil' },
    ],
  },
  {
    role: 'Parent',
    color: 'from-amber-600 to-orange-700',
    pages: [
      { icon: '📊', title: 'Suivi en temps réel', desc: 'Notes, absences, emploi du temps de votre enfant' },
      { icon: '🚫', title: 'Justification absences', desc: 'Justifiez en ligne depuis l\'app mobile' },
      { icon: '💬', title: 'Messagerie', desc: 'Contact direct avec les enseignants' },
      { icon: '📅', title: 'Calendrier', desc: 'Examens, réunions, événements scolaires' },
    ],
  },
];

const TECH_STACK = [
  { category: 'Backend', items: ['FastAPI', 'SQLAlchemy 2.0', 'Celery', 'Redis'], color: 'blue' },
  { category: 'Base de données', items: ['PostgreSQL 16', 'pgvector', 'Alembic'], color: 'indigo' },
  { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind', 'shadcn/ui'], color: 'emerald' },
  { category: 'IA Locale', items: ['Ollama', 'Qwen 2.5 (7B)', 'RAG', 'nomic-embed'], color: 'violet' },
  { category: 'Infrastructure', items: ['Docker', 'Nginx', 'MinIO', 'Prometheus'], color: 'slate' },
  { category: 'Mobile', items: ['React Native', 'Expo', 'Push notifications'], color: 'rose' },
];

export default function LandingDemo() {
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            Don Bosco Connect
          </span>
          <div className="flex items-center gap-6">
            <a href="#features" className={`text-sm font-medium transition ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
              Fonctionnalités
            </a>
            <a href="#architecture" className={`text-sm font-medium transition ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
              Architecture
            </a>
            <a href="/login" className={`rounded-lg px-4 py-2 text-sm font-medium transition ${scrolled ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Connexion
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Plateforme 100% on-premise · Prête pour le déploiement
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              L'IA au service<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                de l'éducation
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-blue-200/80 max-w-2xl">
              Don Bosco Connect modernise la gestion scolaire avec une plateforme <strong className="text-white">100% on-premise</strong>,
              intelligente et sécurisée. Conçue pour le Collège Don Bosco Tunis — aucune donnée ne quitte le réseau de l'école.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition-all">
                Découvrir la plateforme
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </a>
              <a href="#architecture" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all">
                Architecture technique
              </a>
            </div>

            {/* Stats rapides */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '99%', label: 'Disponibilité' },
                { value: '< 3s', label: 'Réponse IA' },
                { value: '500+', label: 'Utilisateurs simultanés' },
                { value: '100%', label: 'Open source' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-blue-300/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPIs Section */}
      <section className="relative -mt-20 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-8 shadow-xl sm:grid-cols-4 border border-gray-100">
          {[
            { value: '100%', label: 'Données sur site', sub: 'Zéro cloud externe' },
            { value: '< 300ms', label: 'Latence IA', sub: 'Ollama en local' },
            { value: 'AES-256', label: 'Chiffrement', sub: 'Messages & données' },
            { value: '4', label: 'Profils', sub: 'Admin, Enseignant, Élève, Parent' },
          ].map((k) => (
            <div key={k.label} className="text-center py-2">
              <div className="text-3xl font-extrabold text-emerald-600">{k.value}</div>
              <div className="mt-1 font-semibold text-gray-800">{k.label}</div>
              <div className="text-sm text-gray-500">{k.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features by Role */}
      <section id="features" ref={featuresRef} className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">4 profils, une plateforme unifiée</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Chaque utilisateur dispose d'une interface adaptée à son rôle avec les outils dont il a besoin.
            </p>
          </div>

          {/* Role tabs */}
          <div className="mt-12 flex justify-center gap-2 flex-wrap">
            {ROLES.map((r, i) => (
              <button
                key={r.role}
                onClick={() => setActiveRole(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  activeRole === i
                    ? `bg-gradient-to-r ${r.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.role}
              </button>
            ))}
          </div>

          {/* Role features */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES[activeRole].pages.map((p) => (
              <div key={p.title} className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Architecture technique</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Stack 100% open source, conteneurisée, conçue pour un déploiement sur site.
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex flex-col items-center">
              {/* Clients */}
              <div className="flex gap-4 mb-6">
                {['🌐 Navigateur Web', '📱 iOS', '🤖 Android'].map((c) => (
                  <div key={c} className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-3 text-sm font-medium text-blue-700">
                    {c}
                  </div>
                ))}
              </div>
              <svg className="w-6 h-6 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Nginx */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-8 py-3 text-sm font-semibold text-amber-700 mb-4">
                🔒 Nginx (TLS 1.3, Rate Limiting)
              </div>
              <svg className="w-6 h-6 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Services grid */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-3xl mb-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <div className="text-lg mb-1">⚡</div>
                  <div className="font-semibold text-emerald-800 text-sm">FastAPI</div>
                  <div className="text-xs text-emerald-600">API REST + WebSocket</div>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 text-center">
                  <div className="text-lg mb-1">🔄</div>
                  <div className="font-semibold text-purple-800 text-sm">Celery</div>
                  <div className="text-xs text-purple-600">Tâches asynchrones</div>
                </div>
                <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4 text-center">
                  <div className="text-lg mb-1">📁</div>
                  <div className="font-semibold text-cyan-800 text-sm">MinIO</div>
                  <div className="text-xs text-cyan-600">Stockage fichiers</div>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Data layer */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-4">
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                  <div className="text-lg mb-1">🗄️</div>
                  <div className="font-semibold text-red-800 text-sm">PostgreSQL 16 + pgvector</div>
                  <div className="text-xs text-red-600">Données + embeddings IA</div>
                </div>
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-center">
                  <div className="text-lg mb-1">⚡</div>
                  <div className="font-semibold text-orange-800 text-sm">Redis 7</div>
                  <div className="text-xs text-orange-600">Cache + Sessions + Queue</div>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>

              {/* Ollama */}
              <div className="rounded-xl bg-violet-50 border border-violet-200 px-8 py-3 text-sm font-semibold text-violet-700">
                🧠 Ollama (Qwen 2.5 7B + nomic-embed-text)
              </div>
            </div>
          </div>

          {/* Stack grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((col) => (
              <div key={col.category} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">{col.category}</h3>
                <ul className="mt-4 space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Sécurité & Conformité</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Conçue pour protéger les données des mineurs. Aucune information ne quitte le réseau de l'école.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: '🔐', title: 'Authentification forte', items: ['JWT 15 min / Refresh 7 jours', 'MFA TOTP obligatoire (admin/enseignant)', 'Blocage après 5 échecs', 'Hash bcrypt cost 12'] },
              { icon: '🔒', title: 'Chiffrement de bout en bout', items: ['Messages AES-256-GCM', 'TLS 1.3 partout', 'Stockage objet signé (URLs présignées)', 'Base de données isolée'] },
              { icon: '📋', title: 'Traçabilité complète', items: ['Audit logs de toutes les actions', 'Logs pseudonymisés (RGPD)', 'Backup quotidien (30 jours)', 'Monitoring Prometheus / Grafana'] },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <ul className="mt-4 space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white">Prêt à moderniser votre établissement ?</h2>
          <p className="mt-4 text-lg text-blue-200/80">
            Don Bosco Connect est prêt pour un déploiement sur site. Stack 100% open source, zéro licence, zéro cloud.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a href="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-emerald-500 transition-all">
              Accéder à la plateforme
            </a>
            <a href="https://github.com/HiTechTN/don-bosco-connect" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              Code source (GitHub)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="font-bold text-white">Don Bosco Connect</h4>
              <p className="mt-2 text-sm text-gray-400">Plateforme éducative intelligente pour le Collège Don Bosco Tunis.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Technologies</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>FastAPI + React + React Native</li>
                <li>PostgreSQL 16 + pgvector</li>
                <li>Ollama + Qwen 2.5</li>
                <li>Docker + Nginx + MinIO</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Contact</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>Collège Don Bosco Tunis</li>
                <li>Réalisé par HiTech TN</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Collège Don Bosco Tunis — Don Bosco Connect. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
