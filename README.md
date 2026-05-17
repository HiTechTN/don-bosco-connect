# Don Bosco Connect

[![CI](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/ci.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/ci.yml)
[![Pages](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/deploy-pages.yml)
[![Docker](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/publish.yml/badge.svg)](https://github.com/HiTechTN/don-bosco-connect/actions/workflows/publish.yml)
[![Docker](https://img.shields.io/badge/GHCR-images-blue?logo=github)](https://github.com/HiTechTN/don-bosco-connect/pkgs/container/don-bosco-connect%2Fbackend)

Plateforme éducative sur-mesure pour le **Collège Don Bosco Tunis**.  
Stack full **on-premise** : IA locale (Ollama), base vectorielle (pgvector), chiffrement AES-256, MFA, et notifications temps réel.

---

## Vidéo de démonstration

https://github.com/user-attachments/assets/506e0ad9-cdd7-4556-9fce-5f9055259e38

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  React 18 + Vite + Tailwind (Web)                   │
│  React Native + Expo 54 (Mobile)                    │
└──────────┬──────────────────────────┬───────────────┘
           │ HTTP/WS                   │ HTTPS
┌──────────▼──────────────────────────▼───────────────┐
│                    Nginx 1.25                        │
│  Rate limiting · Security headers                   │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
┌──────────▼──────────┐  ┌───────────▼───────────────┐
│   FastAPI 0.115      │  │   Workers (Celery)        │
│   SQLAlchemy 2.0     │  │   Redis 7.2               │
│   JWT + MFA + AES    │  └───────────────────────────┘
└──────────┬───────────┘
           │
┌──────────▼──────────────────┐  ┌──────────────────────┐
│  PostgreSQL 16 + pgvector   │  │   Ollama (externe)   │
│  Données : users, notes,    │  │   deepseek-r1:14b    │
│  absences, messages (AES)   │  │   nomic-embed-text   │
│  Vecteurs IA (cosine dist)  │  │   (RAG pipeline)     │
└─────────────────────────────┘  └──────────────────────┘
           │
┌──────────▼──────────┐
│   MinIO (S3)        │
│   Cours PDF/DOCX    │
└─────────────────────┘
```

### Services

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| `db` | pgvector/pgvector:pg16 | 5432 | Base de données + vecteurs |
| `redis` | redis:7.2-alpine | 6379 | Cache / files d'attente |
| `minio` | minio/minio | 9000/9001 | Stockage fichiers |
| `api` | custom | 8000 | FastAPI (backend) |
| `worker` | custom | - | Celery worker |
| `frontend` | custom | 80 | Nginx (static build) |
| `nginx` | nginx:1.25-alpine | 8080 | Reverse proxy |

> Ollama fonctionne sur un serveur externe (192.168.0.100:11434) — configurable via `OLLAMA_BASE_URL`.

---

## Démonstration en ligne

**→ https://hitechtn.github.io/don-bosco-connect/**

### Captures d'écran

#### Administration

| Tableau de bord | Gestion utilisateurs | Classes & Matières |
|:---:|:---:|:---:|
| ![Dashboard](demo/screenshots/admin_02_dashboard.png) | ![Users](demo/screenshots/admin_03_users.png) | ![Classes](demo/screenshots/admin_04_classes.png) |

| Emploi du temps | Journal d'audit |
|:---:|:---:|
| ![Timetable](demo/screenshots/admin_06_timetable.png) | ![Audit](demo/screenshots/admin_07_audit.png) |

#### Enseignant

| Dashboard | Cours | Notes |
|:---:|:---:|:---:|
| ![Dashboard](demo/screenshots/teacher_02_dashboard.png) | ![Cours](demo/screenshots/teacher_03_courses.png) | ![Notes](demo/screenshots/teacher_04_grades.png) |

| Absences | Messages | Assistant IA |
|:---:|:---:|:---:|
| ![Absences](demo/screenshots/teacher_05_absences.png) | ![Messages](demo/screenshots/teacher_06_messages.png) | ![IA](demo/screenshots/teacher_07_ai.png) |

#### Élève

| Dashboard | Notes | Absences |
|:---:|:---:|:---:|
| ![Dashboard](demo/screenshots/student_02_dashboard.png) | ![Notes](demo/screenshots/student_03_grades.png) | ![Absences](demo/screenshots/student_04_absences.png) |

| Emploi du temps | Quiz | Mentor IA | Gamification |
|:---:|:---:|:---:|:---:|
| ![Timetable](demo/screenshots/student_05_timetable.png) | ![Quiz](demo/screenshots/student_06_quizzes.png) | ![IA](demo/screenshots/student_07_ai.png) | ![Gamification](demo/screenshots/student_08_gamification.png) |

#### Parent

| Dashboard | Notes | Absences | Messages |
|:---:|:---:|:---:|:---:|
| ![Dashboard](demo/screenshots/parent_02_dashboard.png) | ![Notes](demo/screenshots/parent_03_grades.png) | ![Absences](demo/screenshots/parent_04_absences.png) | ![Messages](demo/screenshots/parent_05_messages.png) |

---

## Installation

### ⚡ Installation automatique (recommandé)

```bash
curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash
```

> Détection automatique de Docker / Podman, génération de clés AES-256, migration de la base, seed des données de démonstration.

#### Mode GHCR (images pré-construites)

```bash
USE_GHCR=1 GHCR_TOKEN=$(gh auth token) curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash
```

### 📦 Installation manuelle

```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
./scripts/setup.sh
./scripts/start.sh
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
| `scripts/install.sh` | Installation automatique complète (curl \| bash) |
| `scripts/setup.sh` | Configuration post-clonage (.env, SSL, clés) |
| `scripts/start.sh` | Démarrage progressif de la stack |
| `scripts/stop.sh` | Arrêt de tous les services |
| `scripts/reset.sh` | Réinitialisation complète (⚠️ supprime les données) |
| `scripts/healthcheck.sh` | Diagnostic de tous les services |
| `scripts/backup.sh` | Sauvegarde PostgreSQL |
| `scripts/init_db.py` | Seed des données de démonstration |

---

## Développement

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
pytest -v
```

### Frontend web

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # Production
```

### Mobile (React Native)

```bash
cd mobile
npm install
npx expo start
```

### Générer la vidéo de démonstration

```bash
nix-shell -p python3Packages.moviepy python3Packages.gtts python3Packages.pillow python3Packages.numpy
# ou : pip install moviepy gtts pillow numpy

python demo/generate_demo_video.py
# Produit : demo/demo_don_bosco.mp4 + 6 fichiers audio .mp3
```

### Captures d'écran (Playwright)

```bash
# Stack lancée sur http://localhost:8080
nix-shell -p glib -p nodejs --run "node /tmp/demo_screenshots.js"
# Résultat : demo/screenshots/*.png (29 captures, 4 profils)
```

---

## API

Documentation interactive (OpenAPI) : `http://localhost:8000/docs`

### Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/login` | Authentification |
| POST | `/api/v1/auth/refresh` | Rafraîchir JWT |
| GET | `/api/v1/users` | Liste utilisateurs (admin) |
| POST | `/api/v1/courses` | Créer un cours |
| POST | `/api/v1/evaluations` | Créer une évaluation |
| POST | `/api/v1/evaluations/{id}/grades` | Saisie de notes |
| GET | `/api/v1/ai/chat/{conv_id}` | Chat avec Mentor IA (SSE) |
| POST | `/api/v1/ai/quiz/generate` | Générer un quiz |
| POST | `/api/v1/ai/quiz/submit` | Soumettre un quiz (score adaptatif) |
| GET | `/api/v1/gamification/profile` | Profil XP / niveau |
| GET | `/api/v1/gamification/leaderboard` | Classement |
| GET | `/api/v1/gamification/at-risk` | Élèves à risque décrochage |
| WS | `/ws/v1/notifications?token=` | WebSocket notifications |
| WS | `/ws/v1/ai/stream/{conv_id}?token=` | WebSocket streaming IA |

---

## Sécurité

- **JWT** : access token 15 min, refresh token 7 jours
- **MFA** : TOTP obligatoire pour admin & enseignants
- **Chiffrement** : AES-256-GCM pour les messages privés
- **Headers** : HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Rate limiting** : 20 req/s API, 5 req/m login
- **On-premise** : aucune donnée en dehors du réseau local

---

## Fonctionnalités

- **IA RAG locale** : déposez un PDF, l'IA répond basée sur le cours via pgvector + Ollama
- **Quiz adaptatif** : score pondérant rapidité et historique (remediation / normal / advanced)
- **Gamification** : XP, badges, streaks, leaderboard
- **Décrochage** : algorithme prédictif (absences 35%, niveau adaptatif 30%, streaks 15%)
- **Notifications temps réel** : WebSocket pour absences, notes
- **Messagerie chiffrée** : AES-256-GCM entre parents, enseignants, administration
- **Tableaux de bord analytics** : usage IA, distribution notes, statistiques quiz
- **Application mobile** : React Native / Expo avec authentification MFA

---

## Structure du projet

```
don-bosco-connect/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Routeurs FastAPI
│   │   ├── core/             # Sécurité, permissions
│   │   ├── models/           # SQLAlchemy
│   │   ├── schemas/          # Pydantic
│   │   ├── services/         # Logique métier
│   │   └── workers/          # Tâches Celery
│   ├── alembic/              # Migrations
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/       # UI Kit
│       ├── pages/            # admin/ teacher/ student/ parent/
│       ├── lib/              # API helper, utils
│       └── store/            # Zustand
├── mobile/                   # React Native / Expo
├── demo/                     # Démo : vidéo, captures, scripts
│   ├── screenshots/          # 29 captures d'écran (4 profils)
│   ├── generate_demo_video.py
│   └── demo_don_bosco.mp4
├── nginx/
├── scripts/                  # Installation, maintenance
├── docker-compose.yml
├── docker-compose.ghcr.yml
├── docker-compose.override.yml
└── .env.example
```

---

## Licence

Propriété du **Collège Don Bosco Tunis** — usage interne uniquement.
