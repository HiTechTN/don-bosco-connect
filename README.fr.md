# Don Bosco Connect

<p align="center">
  <img src="https://img.shields.io/badge/status-production-059669?style=flat-square" alt="Statut"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/ci.yml?branch=main&style=flat-square&label=CI&color=c96442" alt="CI"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/deploy-pages.yml?branch=main&style=flat-square&label=Pages&color=c96442" alt="Pages"/>
  <img src="https://img.shields.io/github/actions/workflow/status/HiTechTN/don-bosco-connect/publish.yml?branch=main&style=flat-square&label=Docker&color=c96442" alt="Docker"/>
  <img src="https://img.shields.io/github/v/release/HiTechTN/don-bosco-connect?style=flat-square&color=7C3AED" alt="Version"/>
  <img src="https://img.shields.io/github/license/HiTechTN/don-bosco-connect?style=flat-square&color=6B7280" alt="Licence"/>
</p>

<p align="center">
  <b>Plateforme éducative 100% on-premise — IA locale, chiffrée de bout en bout</b><br/>
  <sub>Collège Don Bosco Tunis · Réalisé par HiTech TN</sub>
</p>

<p align="center">
  <a href="https://hitechtn.github.io/don-bosco-connect">🌐 Démo en ligne</a> ·
  <a href="https://github.com/HiTechTN/don-bosco-connect/releases/tag/v1.0.0-mobile-20260519">📱 APK Mobile</a> ·
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.ar.md">🇦🇪 العربية</a>
</p>

---

## 🚀 Démo

<p align="center">
  <a href="https://hitechtn.github.io/don-bosco-connect">
    <img src="https://img.shields.io/badge/🌐_Démo_en_ligne-hitechtn.github.io-2D2A24?style=for-the-badge" alt="Démo"/>
  </a>
  <a href="demo/demo_don_bosco.mp4">
    <img src="https://img.shields.io/badge/🎬_Vidéo_démo-3_min_13_s-c96442?style=for-the-badge" alt="Vidéo"/>
  </a>
</p>

<video src="https://github.com/HiTechTN/don-bosco-connect/raw/main/demo/demo_don_bosco.mp4" controls width="100%" poster="https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/demo/screenshots/00_landing.png" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"></video>

<br/>

<details>
<summary><b>📸 Voir les 29 captures d'écran</b></summary>
<br/>

| Profil | Aperçu |
|--------|--------|
| **🛡️ Admin** | [`Dashboard`](demo/screenshots/admin_02_dashboard.png) · [`Utilisateurs`](demo/screenshots/admin_03_users.png) · [`Classes`](demo/screenshots/admin_04_classes.png) · [`Emploi du temps`](demo/screenshots/admin_06_timetable.png) · [`Audit`](demo/screenshots/admin_07_audit.png) |
| **👨‍🏫 Enseignant** | [`Dashboard`](demo/screenshots/teacher_02_dashboard.png) · [`Cours`](demo/screenshots/teacher_03_courses.png) · [`Notes`](demo/screenshots/teacher_04_grades.png) · [`Absences`](demo/screenshots/teacher_05_absences.png) · [`Messages`](demo/screenshots/teacher_06_messages.png) · [`IA`](demo/screenshots/teacher_07_ai.png) |
| **🧑‍🎓 Élève** | [`Dashboard`](demo/screenshots/student_02_dashboard.png) · [`Notes`](demo/screenshots/student_03_grades.png) · [`Absences`](demo/screenshots/student_04_absences.png) · [`Emploi du temps`](demo/screenshots/student_05_timetable.png) · [`Quiz`](demo/screenshots/student_06_quizzes.png) · [`Mentor IA`](demo/screenshots/student_07_ai.png) · [`Gamification`](demo/screenshots/student_08_gamification.png) |
| **👪 Parent** | [`Dashboard`](demo/screenshots/parent_02_dashboard.png) · [`Notes`](demo/screenshots/parent_03_grades.png) · [`Absences`](demo/screenshots/parent_04_absences.png) · [`Messages`](demo/screenshots/parent_05_messages.png) |

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
| **Quiz adaptatif** | Score selon rapidité + historique → niveau remediation / normal / advanced |
| **Décrochage prédictif** | Algorithme : absences 35%, niveau 30%, régularité 15% |
| **Assistant IA** | DeepSeek R1 14B + nomic-embed-text via Ollama |

### 📱 Application Mobile

React Native / Expo — iOS & Android avec notifications push, biométrie, et mode hors-ligne.

<p align="center">
  <a href="https://github.com/HiTechTN/don-bosco-connect/releases/tag/v1.0.0-mobile-20260519">
    <img src="https://img.shields.io/badge/📥_Télécharger_l'APK-c96442?style=for-the-badge" alt="APK"/>
  </a>
</p>

---

## 🏗️ Architecture

```
                     ┌──────────────────────┐
                     │  React 18 + Vite      │  ← Web (SPA)
                     │  React Native (Expo)  │  ← Mobile
                     └──────────┬───────────┘
                                │ HTTP / WebSocket
                     ┌──────────▼───────────┐
                     │  Nginx 1.25           │  :8080
                     │  Rate limiting · CSP  │
                     └──────────┬───────────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
     ┌─────────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
     │  FastAPI        │  │  Redis 7   │  │  Celery      │
     │  SQLAlchemy 2.0 │  │  Cache     │  │  Workers     │
     │  JWT + MFA      │  │  Queue     │  └─────────────┘
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
│   ├── app/schemas   # Pydantic
│   └── app/workers   # Tâches Celery
├── frontend/         # React 18 · Vite · Tailwind · shadcn/ui
│   └── src/
│       ├── pages/    # Tableaux de bord (admin, teacher, student, parent)
│       ├── components/ # Composants réutilisables
│       └── lib/      # Mock API, services
├── mobile/           # React Native / Expo
│   └── src/
│       ├── screens/  # 22 écrans
│       ├── components/
│       └── navigation/
├── demo/             # Vidéo · Captures d'écran
├── nginx/            # Configuration reverse proxy
├── scripts/          # Installation · Maintenance
├── monitoring/       # Prometheus · Grafana
├── .github/          # Workflows CI/CD
├── docker-compose.yml
└── .env.example
```

---

## 📊 Stack Technique

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Celery-37814A?style=flat-square&logo=celery&logoColor=white" alt="Celery"/>
  <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" alt="Nginx"/>
  <img src="https://img.shields.io/badge/MinIO-C72E49?style=flat-square&logo=minio&logoColor=white" alt="MinIO"/>
  <img src="https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white" alt="Ollama"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white" alt="Prometheus"/>
  <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white" alt="Grafana"/>
</p>

---

## 📄 Licence

Propriété du **Collège Don Bosco Tunis** — usage interne uniquement.

<p align="center">
  <sub>Réalisé avec ❤️ par <a href="https://github.com/HiTechTN">HiTech TN</a></sub>
</p>
