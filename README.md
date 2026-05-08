# Don Bosco Connect

Plateforme éducative sur-mesure pour le **Collège Don Bosco Tunis**.  
Stack full **on-premise** : IA locale (Ollama), base vectorielle (pgvector), chiffrement AES-256, MFA, et notifications temps réel.

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
│  TLS 1.3 · Rate limiting · Security headers         │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
┌──────────▼──────────┐  ┌───────────▼───────────────┐
│   FastAPI 0.115      │  │   Celery 5.3 + Redis 7.2 │
│   SQLAlchemy 2.0     │  │   Worker / Beat / Flower  │
│   JWT + MFA + AES    │  └───────────────────────────┘
└──────────┬───────────┘
           │
┌──────────▼──────────────────┐  ┌──────────────────┐
│  PostgreSQL 16 + pgvector   │  │   Ollama          │
│  Données : users, notes,    │  │   qwen2.5:7b      │
│  absences, messages (AES)   │  │   nomic-embed-text│
│  Vecteurs IA (cosine dist)  │  │   (RAG pipeline)  │
└─────────────────────────────┘  └──────────────────┘
           │
┌──────────▼──────────┐
│   MinIO (S3)        │
│   Cours PDF/DOCX    │
└─────────────────────┘
```

### Services

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| `db` | postgres:16 + pgvector | 5432 | Base de données |
| `redis` | redis:7.2-alpine | 6379 | Cache / files d'attente |
| `minio` | minio/minio | 9000/9001 | Stockage fichiers |
| `ollama` | ollama/ollama | 11434 | LLM local (Qwen 2.5) |
| `api` | custom | 8000 | FastAPI (backend) |
| `worker` | custom | - | Celery worker |
| `beat` | custom | - | Celery beat (tâches planifiées) |
| `flower` | custom | 5555 | Monitoring Celery |
| `frontend` | custom | 5173 | Vite dev server |
| `nginx` | nginx:1.25-alpine | 80/443 | Reverse proxy |
| `prometheus` | prom/prometheus | 9090 | Métriques |
| `grafana` | grafana/grafana | 3000 | Dashboards |

---

## Démarrage rapide

### Prérequis

- Docker & Docker Compose v2
- GPU NVIDIA (recommandé pour Ollama) ou CPU

### 1. Cloner & configurer

```bash
git clone https://github.com/DonBoscoTunis/don-bosco-connect.git
cd don-bosco-connect
cp .env.example .env
# Éditer .env : clés secrètes, mots de passe, etc.
```

### 2. Lancer la stack

```bash
docker compose up -d
```

### 3. Initialiser la base

```bash
docker compose exec api python scripts/init_db.py
```

### 4. Télécharger les modèles Ollama

```bash
docker compose exec ollama ollama pull qwen2.5:7b-instruct
docker compose exec ollama ollama pull nomic-embed-text
```

### 5. Accéder

| Interface | URL |
|-----------|-----|
| Application | https://donbosco.local |
| MinIO Console | http://localhost:9001 |
| Flower | http://localhost:5555 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@donbosco.tn | admin123! |
| Enseignant | karim.hamdi@donbosco.tn | teacher123! |
| Élève | adam.slim@donbosco.tn | student123! |
| Parent | ahmed.slim@parent.tn | parent123! |

---

## Développement

### Backend

```bash
# Python 3.12+ requis
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env

# Lancer (hors Docker)
uvicorn app.main:app --reload --port 8000

# Tests
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

### Générer la démo vidéo

```bash
pip install gtts moviepy pillow numpy
python demo/generate_audio.py   # TTS
python demo/generate_video.py   # Montage
# Avec captures réelles (stack lancée) :
pip install playwright && playwright install chromium
python demo/capture_screenshots.py --base-url https://donbosco.local
```

---

## API

Documentation interactive (OpenAPI) : `https://donbosco.local/api/docs`

### Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/login` | Authentification |
| POST | `/api/v1/auth/refresh` | Rafraîchir JWT |
| POST | `/api/v1/auth/mfa/setup` | Activer MFA TOTP |
| GET | `/api/v1/users` | Liste utilisateurs (admin) |
| POST | `/api/v1/courses` | Créer un cours |
| POST | `/api/v1/courses/{id}/upload` | Uploader un fichier PDF/DOCX |
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
- **Gamification** : XP, badges (7 disponibles), streaks, leaderboard
- **Décrochage** : algorithme prédictif pondérant absences (35%), niveau adaptatif (30%), streaks (15%)
- **Notifications temps réel** : WebSocket pour absences, notes, etc.
- **Messagerie chiffrée** : AES-256-GCM entre parents, enseignants, administration
- **Tableaux de bord analytics** : usage IA, distribution notes, statistiques quiz
- **Application mobile** : React Native / Expo avec authentification MFA

---

## Déploiement

### Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Variables requises dans `.env` :
- `SECRET_KEY` (32+ caractères)
- `ENCRYPTION_KEY` (32 bytes hex)
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`

### Sauvegarde

```bash
./scripts/backup.sh
```

Sauvegarde : dump PostgreSQL + export MinIO → `/backups/`

---

## Structure du projet

```
don-bosco-connect/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Routeurs FastAPI
│   │   ├── core/             # Sécurité, permissions, exceptions
│   │   ├── models/           # SQLAlchemy (base.py)
│   │   ├── schemas/          # Pydantic
│   │   ├── services/         # Logique métier
│   │   ├── workers/          # Tâches Celery
│   │   └── config.py
│   ├── alembic/              # Migrations
│   ├── scripts/              # Seed
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/       # UI Kit + LandingDemo
│       ├── pages/            # admin/ teacher/ student/ parent/
│       ├── lib/              # API helper, utils
│       └── store/            # Zustand
├── mobile/
│   └── src/                  # React Native / Expo
├── demo/                     # Scripts démo (TTS + vidéo + Playwright)
├── assets/                   # Fichiers générés (audio, vidéo)
├── nginx/
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
├── docker-compose.yml
└── .env.example
```

---

## Licence

Propriété du **Collège Don Bosco Tunis** — usage interne uniquement.
