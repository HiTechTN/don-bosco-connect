import { useRef, useState } from "react";

const KPIS = [
  { value: "100%", label: "Donnees sur site", sub: "Zéro cloud externe" },
  { value: "<300ms", label: "Latence IA", sub: "Ollama en local" },
  { value: "AES-256", label: "Chiffrement", sub: "Messages & donnees" },
  { value: "4", label: "Profils", sub: "Admin, Enseignant, Eleve, Parent" },
];

const FEATURES = [
  {
    icon: "\U0001f4c4",
    title: "Upload & Indexation RAG",
    desc: "Deposez un PDF, l'IA le vectorise et repond aux questions des eleves.",
  },
  {
    icon: "\U0001f9e0",
    title: "Mentor IA Adaptatif",
    desc: "Assistant virtuel base sur le contexte du cours. Pas d'hallucination.",
  },
  {
    icon: "\U0001f3af",
    title: "Quiz Adaptatif",
    desc: "Score en temps reel ponderant rapidite et historique. Niveaux remediation/avance.",
  },
  {
    icon: "\U0001f3c6",
    title: "Gamification",
    desc: "XP, badges, streaks et leaderboard. L'apprentissage devient un jeu.",
  },
  {
    icon: "\U0001f514",
    title: "Notifications WebSocket",
    desc: "Alertes absences publications en temps reel via WebSocket.",
  },
  {
    icon: "\U0001f4ca",
    title: "Pilotage Analytics",
    desc: "Tableaux de bord pour l'administration : usage, notes, decrochage.",
  },
];

const SCREENSHOTS = [
  { src: "/screenshots/teacher_dashboard.png", label: "Dashboard Enseignant" },
  { src: "/screenshots/student_chat.png", label: "Mentor IA Eleve" },
  { src: "/screenshots/parent_grades.png", label: "Suivi Parent" },
];

export default function LandingDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-teal-800 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">Don Bosco Connect</span>
          <div className="flex gap-4">
            <a href="/login" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition">Connexion</a>
            <a href="#demo" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 transition">Demo</a>
          </div>
        </nav>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            L'IA au service<br />de l'education
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100">
            Don Bosco Connect modernise la gestion scolaire avec une plateforme<strong className="text-white"> 100% on-premise</strong>,
            intelligente et securisee. Concu pour le College Don Bosco Tunis.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="#demo" className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold shadow-lg hover:bg-emerald-400 transition">
              Voir la video
            </a>
            <a href="https://github.com/DonBoscoTunis/don-bosco-connect" target="_blank" rel="noreferrer"
              className="rounded-xl border border-white/30 px-8 py-3 font-semibold hover:bg-white/10 transition">
              Code source
            </a>
          </div>
        </div>
      </header>

      {/* ─── KPIs ─── */}
      <section className="border-b bg-gray-50 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="text-center">
              <div className="text-3xl font-extrabold text-emerald-700">{k.value}</div>
              <div className="mt-1 font-semibold text-gray-800">{k.label}</div>
              <div className="text-sm text-gray-500">{k.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Vidéo Demo ─── */}
      <section id="demo" className="bg-gray-900 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Video de presentation</h2>
          <p className="mt-2 text-gray-400">Parcours complet en 3 minutes</p>
          <div className="mt-8 overflow-hidden rounded-2xl shadow-2xl">
            {!videoLoaded && (
              <div className="flex aspect-video items-center justify-center bg-gray-800 text-gray-500">
                Chargement...
              </div>
            )}
            <video
              ref={videoRef}
              controls
              playsInline
              className={`w-full ${videoLoaded ? "" : "hidden"}`}
              onLoadedData={() => setVideoLoaded(true)}
            >
              <source src="/assets/demo_don_bosco.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">Fonctionnalites cles</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture ─── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Architecture technique</h2>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {[
              { title: "Backend", items: ["FastAPI + SQLAlchemy 2.0", "PostgreSQL 16 + pgvector", "Redis + Celery", "Ollama (Qwen 2.5)"] },
              { title: "Frontend", items: ["React 18 + TypeScript", "Tailwind CSS 3.4", "TanStack Query 5", "React Native / Expo"] },
              { title: "Securite", items: ["JWT 15 min / refresh 7j", "MFA TOTP", "AES-256-GCM messages", "TLS 1.3 + HSTS"] },
            ].map((col) => (
              <div key={col.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-bold text-emerald-700">{col.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Captures d'écran ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">Apercus de l'application</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {SCREENSHOTS.map((s) => (
              <div key={s.label} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center bg-gray-200 text-gray-400 text-sm">
                  {s.label}
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-sm font-medium text-white">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t bg-gray-900 py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} College Don Bosco Tunis — Don Bosco Connect. Tous droits reserves.</p>
      </footer>
    </div>
  );
}
