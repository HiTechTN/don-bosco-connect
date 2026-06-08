# Don Bosco Connect

<p align="center">
  <img src="https://img.shields.io/badge/status-production-059669?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/ci.yml?branch=main&style=flat-square&label=CI&color=c96442" alt="CI"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/deploy-pages.yml?branch=main&style=flat-square&label=Pages&color=c96442" alt="Pages"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/publish.yml?branch=main&style=flat-square&label=Docker&color=c96442" alt="Docker"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/build.yml?branch=main&style=flat-square&label=Build&color=7C3AED" alt="Build"/>
  <img src="https://img.shields.io/github/v/release/HiTechTN/don-bosco-connect?style=flat-square&color=7C3AED" alt="Release"/>
  <img src="https://img.shields.io/github/license/HiTechTN/don-bosco-connect?style=flat-square&color=6B7280" alt="License"/>
</p>

<p align="center">
  <b lang="fr">Plateforme éducative 100% on-premise — IA locale, chiffrée de bout en bout</b><br/>
  <span lang="en">100% on-premise educational platform — local AI, end-to-end encrypted</span><br/>
  <sub>Collège Don Bosco Tunis · Réalisé par HiTech TN</sub>
</p>

<p align="center">
  <a href="https://hitechtn.github.io/don-bosco-connect">🌐 Démo en ligne</a> ·
  <a href="https://github.com/HiTechTN/don-bosco-connect/releases/download/v2.2.0/DonBoscoConnect-v2.2.0.apk">📱 APK Mobile</a> ·
  <a href="CHANGELOG.md">📋 CHANGELOG</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> &#124;
  <a href="README.ar.md">🇦🇪 العربية</a>
</p>

---

## 🚀 Démo

<p align="center">
  <a href="https://hitechtn.github.io/don-bosco-connect">
    <img src="https://img.shields.io/badge/🌐_Démo_en_ligne-hitechtn.github.io-2D2A24?style=for-the-badge" alt="Démo"/>
  </a>
  <a href="https://hitechtn.github.io/don-bosco-connect/demo.html">
    <img src="https://img.shields.io/badge/🎬_Démo_interactive-Vidéo_+_Carousel-c96442?style=for-the-badge" alt="Démo interactive"/>
  </a>
  <a href="https://github.com/HiTechTN/don-bosco-connect/releases/download/v2.2.0/DonBoscoConnect-v2.2.0.apk">
    <img src="https://img.shields.io/badge/📱_APK_Mobile-7C3AED?style=for-the-badge" alt="APK"/>
  </a>
</p>

### 🎬 Vidéo & Carousel interactif

<p align="center">
  <a href="https://hitechtn.github.io/don-bosco-connect/demo.html">
    <img src="https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/00_login.png" width="80%" alt="Démo interactive — Cliquez pour voir la vidéo et le carousel" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);" />
  </a>
</p>

<p align="center">
  <sub>▶️ Cliquez pour lancer la vidéo de présentation et naviguer dans les captures d'écran par profil</sub>
</p>

<details>
<summary><b>🔑 Comptes de démonstration</b></summary>
<br/>

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 🛡️ Admin | `admin@donbosco.tn` | `admin123!` |
| 👨‍🏫 Enseignant | `karim.hamdi@donbosco.tn` | `teacher123!` |
| 🧑‍🎓 Élève | `adam.slim@donbosco.tn` | `student123!` |
| 👪 Parent | `ahmed.slim@parent.tn` | `parent123!` |

</details>

---

## ✨ Fonctionnalités

<div align="center">

| Profil | Fonctionnalités |
|--------|----------------|
| 🛡️ **Admin** | Dashboard analytics · CRUD utilisateurs · Classes · Matières · Emploi du temps · Événements · Audit logs |
| 👨‍🏫 **Enseignant** | Dépôt de cours IA · Carnet de notes · Absences · Assistant IA · Messagerie chiffrée |
| 🧑‍🎓 **Élève** | Mentor IA 24/7 · Quiz adaptatif · Gamification (XP, badges, streaks) · Notes · Emploi du temps · Classement |
| 👪 **Parent** | Suivi temps réel · Justification absences · Messagerie · Calendrier scolaire |

</div>

### 🧠 IA & Intelligence

| Technologie | Description |
|-------------|-------------|
| **RAG locale** | PDF déposé → indexé → l'IA répond sur le contenu du cours uniquement |
| **Streaming SSE** | Réponses IA en temps réel via Server-Sent Events |
| **Quiz adaptatif** | Score selon rapidité + historique → niveau remediation / normal / advanced |
| **Décrochage prédictif** | Algorithme : absences 35%, niveau 30%, régularité 15% |
| **Assistant IA** | DeepSeek R1 14B + nomic-embed-text via Ollama |
| **Cache embeddings** | SHA256 + Redis (TTL 24h) pour vectorisation rapide |

### ⚡ Nouveautés v2.2.0

| Feature | Description |
|---------|-------------|
| **CICD renforcé** | 6 workflows — ruff 0.15.16, Node 24, Bandit, detect-secrets, buildx, cache multi-chemins |
| **Migration Node 24** | `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` sur tous les workflows |
| **Sécurité** | Fix migration email (unique index), defusedxml (B314), requêtes paramétrées (B608) |
| **Tests E2E** | 120/120 — mock API déterministe, visual regression CI-compatible, plus de flaky |
| **Docker** | BuildKit, cache layers, versions épinglées (nginx, minio, ollama, grafana) |
| **Secrets** | `.env.production` purgé, détection étendue à tous les `.env.*` |

### 📱 Application Mobile

React Native / Expo — iOS & Android avec notifications push, biométrie, et mode hors-ligne.

<p align="center">
  <a href="https://github.com/HiTechTN/don-bosco-connect/releases/download/v2.2.0/DonBoscoConnect-v2.2.0.apk">
    <img src="https://img.shields.io/badge/📥_Télécharger_l'APK-c96442?style=for-the-badge" alt="APK Download"/>
  </a>
</p>

---

## 🏗️ Architecture

```
                     ┌──────────────────────────┐
                     │  React 18 + Vite          │  ← Web (SPA)
                     │  TanStack Query v5        │  ← Hooks API
                     │  React Native (Expo)      │  ← Mobile
                     └──────────┬───────────────┘
                                │ HTTP / WebSocket / SSE
                     ┌──────────▼───────────────┐
                     │  Nginx 1.25               │  :8080
                     │  Rate limiting · CSP      │
                     └──────────┬───────────────┘
                                │
               ┌────────────────┼──────────────────┐
               │                │                  │
     ┌─────────▼──────┐  ┌─────▼──────┐  ┌────────▼───────┐
     │  FastAPI        │  │  Redis 7   │  │  Celery         │
     │  SQLAlchemy 2.0 │  │  Cache     │  │  Workers        │
     │  JWT + MFA      │  │  Pub/Sub   │  └────────────────┘
     │  SSE Streaming  │  │  Queue     │
     └─────────┬───────┘  └───────────┘
               │
     ┌─────────▼──────────────────────┐  ┌──────────────────────┐
     │  PostgreSQL 16 + pgvector       │  │  Ollama (externe)    │
     │  Données · Embeddings IA        │  │  DeepSeek 14B        │
     └─────────────────────────────────┘  │  nomic-embed-text    │
               │                          └──────────────────────┘
     ┌─────────▼──────────┐
     │  MinIO (S3)         │
     │  Cours · Documents  │
     └─────────────────────┘
```

### Services

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| `db` | `pgvector/pgvector:pg16` | 5432 | Base + vecteurs |
| `redis` | `redis:7.2-alpine` | 6379 | Cache / queue |
| `minio` | `minio/minio` | 9000-9001 | Stockage fichiers |
| `api` | *custom* | 8000 | Backend FastAPI |
| `worker` | *custom* | — | Tâches Celery |
| `frontend` | *custom* | 80 | Static build nginx |
| `nginx` | `nginx:1.25-alpine` | **8080** | Reverse proxy |

> **Ollama** : externe (configurable via `OLLAMA_BASE_URL`). Modèles recommandés : `deepseek-r1-tool-calling:14b`, `nomic-embed-text`.

---

## 🛡️ Sécurité

<div align="center">

| Mesure | Implémentation |
|--------|---------------|
| **Authentification** | JWT (15 min) + Refresh token (7 jours) |
| **MFA** | TOTP obligatoire (admin & enseignants) |
| **Chiffrement** | AES-256-GCM (messages privés) |
| **Headers** | HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| **Rate limiting** | API 20 req/s · Login 5 req/m |
| **Hébergement** | 100% on-premise · Zéro cloud |

</div>

---

## 📦 Installation

### Automatique (recommandé)

```bash
curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash
```

### Mode GHCR (images pré-construites)

```bash
USE_GHCR=1 GHCR_TOKEN=$(gh auth token) curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash
```

### Manuelle

```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
./scripts/setup.sh    # Configure .env, SSL, clés
./scripts/start.sh    # Démarre la stack Docker
```

### 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 🛡️ Admin | `admin@donbosco.tn` | `admin123!` |
| 👨‍🏫 Enseignant | `karim.hamdi@donbosco.tn` | `teacher123!` |
| 🧑‍🎓 Élève | `adam.slim@donbosco.tn` | `student123!` |
| 👪 Parent | `ahmed.slim@parent.tn` | `parent123!` |

### 📜 Scripts

| Script | Usage |
|--------|-------|
| `install.sh` | Installation automatique (curl \| bash) |
| `scripts/setup.sh` | Configuration post-clonage (.env, SSL, clés) |
| `scripts/start.sh` / `stop.sh` | Démarrage / arrêt de la stack |
| `scripts/reset.sh` | Réinitialisation complète (⚠️ données) |
| `scripts/healthcheck.sh` | Diagnostic des services |
| `scripts/backup.sh` | Sauvegarde PostgreSQL |
| `scripts/init_db.py` | Seed des données de démonstration |
| `scripts/validate.sh` | Validation production (6 étapes) |

---

## 💻 Développement

```bash
# Backend FastAPI
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest -v

# Frontend Web (React + Vite)
cd frontend
npm install && npm run dev    # → http://localhost:5173

# Mobile (React Native / Expo)
cd mobile
npm install && npx expo start

# Générer la vidéo de démo
pip install moviepy gtts pillow numpy
python demo/generate_demo_video.py  # → demo/demo_don_bosco.mp4
```

**API docs** → [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## 📁 Structure

```
don-bosco-connect/
├── backend/          # FastAPI · SQLAlchemy · Alembic · Celery
│   ├── app/api/v1    # Routeurs REST
│   ├── app/models    # Modèles SQLAlchemy
│   ├── app/schemas   # Pydantic v2
│   ├── app/services  # Business logic
│   ├── app/workers   # Tâches Celery
│   └── app/tests     # Tests pytest-asyncio
├── frontend/         # React 18 · Vite · TanStack Query · Tailwind
│   └── src/
│       ├── hooks/    # 15 hooks TanStack Query (SEUL point d'appel API)
│       ├── pages/    # Tableaux de bord (admin, teacher, student, parent)
│       ├── components/ # Composants réutilisables
│       ├── types/    # Interfaces TypeScript strictes
│       └── lib/      # API client, query client, constantes
├── mobile/           # React Native / Expo
│   └── src/
│       ├── screens/  # 22 écrans
│       ├── components/
│       └── navigation/
├── demo/             # Vidéo · Captures d'écran
├── nginx/            # Configuration reverse proxy
├── scripts/          # Installation · Maintenance · Validation
├── monitoring/       # Prometheus · Grafana
├── .github/          # Workflows CI/CD (Build, CI, Release, Docker, Pages)
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## 📊 Stack Technique

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query"/>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Celery-37814A?style=flat-square&logo=celery&logoColor=white" alt="Celery"/>
  <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" alt="Nginx"/>
  <img src="https://img.shields.io/badge/MinIO-C72E49?style=flat-square&logo=minio&logoColor=white" alt="MinIO"/>
  <img src="https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white" alt="Ollama"/>
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white" alt="Prometheus"/>
  <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white" alt="Grafana"/>
</p>

---

## 📄 Licence

Propriété du **Collège Don Bosco Tunis** — usage interne uniquement.

<p align="center">
  <sub>Réalisé avec ❤️ par <a href="https://github.com/HiTechTN">HiTech TN</a></sub>
</p>
