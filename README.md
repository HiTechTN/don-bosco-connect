# Don Bosco Connect

[![CI](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/ci.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/ci.yml)
[![Pages](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/deploy-pages.yml)
[![Docker](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/publish.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/publish.yml)
[![GHCR](https://img.shields.io/badge/GHCR-images-blue?logo=github)](https://github.com/HiTechTN/don-bosco-connect/pkgs/container/don-bosco-connect%2Fbackend)

**Don Bosco Connect** est une plateforme éducative sur-mesure pour le Collège Don Bosco Tunis — 100 % on-premise, IA locale, chiffrée de bout en bout.

---

## Démo

**En ligne** → [hitechtn.github.io/don-bosco-connect](https://hitechtn.github.io/don-bosco-connect/)<br>
**Vidéo** → [`demo/demo_don_bosco.mp4`](demo/demo_don_bosco.mp4) (3 min 13 s)

<video src="https://github.com/HiTechTN/don-bosco-connect/raw/main/demo/demo_don_bosco.mp4" controls width="100%" poster="demo/screenshots/00_landing.png"></video>

<details>
<summary>📷 Voir les 29 captures d'écran</summary>

| Profil | Pages |
|--------|-------|
| **Admin** | [Dashboard](demo/screenshots/admin_02_dashboard.png) · [Utilisateurs](demo/screenshots/admin_03_users.png) · [Classes](demo/screenshots/admin_04_classes.png) · [Emploi du temps](demo/screenshots/admin_06_timetable.png) · [Audit](demo/screenshots/admin_07_audit.png) |
| **Enseignant** | [Dashboard](demo/screenshots/teacher_02_dashboard.png) · [Cours](demo/screenshots/teacher_03_courses.png) · [Notes](demo/screenshots/teacher_04_grades.png) · [Absences](demo/screenshots/teacher_05_absences.png) · [Messages](demo/screenshots/teacher_06_messages.png) · [IA](demo/screenshots/teacher_07_ai.png) |
| **Élève** | [Dashboard](demo/screenshots/student_02_dashboard.png) · [Notes](demo/screenshots/student_03_grades.png) · [Absences](demo/screenshots/student_04_absences.png) · [Emploi du temps](demo/screenshots/student_05_timetable.png) · [Quiz](demo/screenshots/student_06_quizzes.png) · [Mentor IA](demo/screenshots/student_07_ai.png) · [Gamification](demo/screenshots/student_08_gamification.png) |
| **Parent** | [Dashboard](demo/screenshots/parent_02_dashboard.png) · [Notes](demo/screenshots/parent_03_grades.png) · [Absences](demo/screenshots/parent_04_absences.png) · [Messages](demo/screenshots/parent_05_messages.png) |

</details>

---

## Installation

```bash
# Automatique (recommandé)
curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash

# Mode GHCR (images pré-construites)
USE_GHCR=1 GHCR_TOKEN=$(gh auth token) curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash

# Manuelle
git clone https://github.com/HiTechTN/don-bosco-connect.git && cd don-bosco-connect
./scripts/setup.sh && ./scripts/start.sh
```

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@donbosco.tn | admin123! |
| Enseignant | karim.hamdi@donbosco.tn | teacher123! |
| Élève | adam.slim@donbosco.tn | student123! |
| Parent | ahmed.slim@parent.tn | parent123! |

### Scripts

| Script | Usage |
|--------|-------|
| `install.sh` | Installation automatique (curl \| bash) |
| `setup.sh` | Configuration post-clonage (.env, SSL, clés) |
| `start.sh` / `stop.sh` | Démarrage / arrêt de la stack |
| `reset.sh` | Réinitialisation complète (⚠️ données) |
| `healthcheck.sh` | Diagnostic des services |
| `backup.sh` | Sauvegarde PostgreSQL |
| `init_db.py` | Seed des données de démonstration |

---

## Architecture

```
                    ┌─────────────────────┐
                    │  React 18 + Vite     │  ← Web
                    │  React Native (Expo) │  ← Mobile
                    └─────────┬───────────┘
                              │ HTTP / WS
                    ┌─────────▼───────────┐
                    │  Nginx 1.25          │  :8080
                    │  Rate limiting · CSP │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐  ┌────▼─────┐  ┌──────▼──────┐
    │  FastAPI         │  │  Redis   │  │  Workers     │
    │  SQLAlchemy      │  │  Cache   │  │  Celery      │
    │  JWT + MFA + AES │  │  Queue   │  └─────────────┘
    └─────────┬───────┘  └──────────┘
              │
    ┌─────────▼──────────────────┐  ┌──────────────────┐
    │  PostgreSQL 16 + pgvector   │  │  Ollama (externe)│
    │  Données · Vecteurs IA      │  │  LLM · Embeddings│
    └─────────────────────────────┘  └──────────────────┘
              │
    ┌─────────▼──────────┐
    │  MinIO (S3)         │
    │  Cours PDF/DOCX     │
    └─────────────────────┘
```

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| `db` | pgvector/pgvector:pg16 | 5432 | Base + vecteurs |
| `redis` | redis:7.2-alpine | 6379 | Cache / queue |
| `minio` | minio/minio | 9000-9001 | Stockage fichiers |
| `api` | custom | 8000 | Backend FastAPI |
| `worker` | custom | — | Tâches Celery |
| `frontend` | custom | 80 | Static build nginx |
| `nginx` | nginx:1.25-alpine | **8080** | Reverse proxy |

> Ollama : externe (configurable via `OLLAMA_BASE_URL`). Modèles : `deepseek-r1-tool-calling:14b`, `nomic-embed-text`.

---

## Fonctionnalités

- **IA RAG locale** — PDF déposé → indexé → l'IA répond sur le contenu du cours uniquement
- **Quiz adaptatif** — score selon rapidité + historique → niveau remediation / normal / advanced
- **Gamification** — XP, badges (7), streaks, classement bienveillant
- **Décrochage prédictif** — algorithme : absences 35 %, niveau 30 %, régularité 15 %
- **Notifications temps réel** — WebSocket (absences, notes, messages)
- **Messagerie chiffrée** — AES-256-GCM parents ↔ enseignants ↔ administration
- **MFA** — TOTP obligatoire pour admin et enseignants
- **Tableaux de bord analytics** — usage IA, distribution notes, quiz
- **Application mobile** — React Native / Expo

---

## Sécurité

| Mesure | Détail |
|--------|--------|
| Authentification | JWT (15 min) + refresh token (7 j) |
| MFA | TOTP (admin & enseignants) |
| Chiffrement | AES-256-GCM (messages privés) |
| Headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| Rate limiting | API 20 req/s, login 5 req/m |
| Hébergement | 100 % on-premise, zéro cloud |

---

## Développement

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest -v

# Frontend Web
cd frontend && npm install && npm run dev  # :5173

# Mobile
cd mobile && npm install && npx expo start

# Vidéo de démo
pip install moviepy gtts pillow numpy
python demo/generate_demo_video.py            # → demo/demo_don_bosco.mp4
```

API docs : `http://localhost:8000/docs`

---

## Structure

```
don-bosco-connect/
├── backend/         # FastAPI · SQLAlchemy · Alembic · Celery
│   ├── app/api/v1   # Routeurs
│   ├── app/models   # SQLAlchemy
│   ├── app/schemas  # Pydantic
│   └── app/workers  # Tâches
├── frontend/        # React 18 · Vite · Tailwind · shadcn/ui
├── mobile/          # React Native / Expo
├── demo/            # Vidéo · captures · scripts de démo
├── nginx/           # Configuration reverse proxy
├── scripts/         # Installation · maintenance
├── docker-compose.yml
├── docker-compose.ghcr.yml
├── docker-compose.override.yml
└── .env.example
```

---

## Licence

Propriété du **Collège Don Bosco Tunis** — usage interne uniquement.
