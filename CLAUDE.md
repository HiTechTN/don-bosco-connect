# CLAUDE.md — Don Bosco Connect

## Commandes essentielles
- Démarrer : `docker compose up -d`
- Tests backend : `cd backend && pytest --cov=app -v`
- Types frontend : `cd frontend && npx tsc --noEmit`
- Lint : `cd frontend && npx eslint src`
- Migration DB : `alembic revision --autogenerate -m "description"`
- Appliquer migration : `alembic upgrade head`

## Architecture
```
don-bosco-connect/
├── backend/app/
│   ├── api/v1/      # Routeurs REST (auth, users, grades, ai, absences, schedule)
│   ├── models/      # SQLAlchemy ORM
│   ├── schemas/     # Pydantic v2
│   ├── services/    # Business logic (séparé des routeurs)
│   ├── workers/     # Celery tasks
│   └── core/        # Config, security, database, deps
├── frontend/src/
│   ├── hooks/       # TanStack Query hooks (SEUL endroit qui appelle l'API)
│   ├── pages/       # Admin / Teacher / Student / Parent dashboards
│   ├── components/  # UI réutilisables
│   ├── types/       # Interfaces TypeScript
│   └── lib/         # Utils, constants (PAS de fetch ici)
├── mobile/src/
│   ├── screens/     # 22 écrans
│   └── hooks/       # Hooks partagés
└── scripts/         # Setup, backup, healthcheck
```

## Conventions
- Python : Black + isort + mypy strict
- TypeScript : strict:true, pas de any, interfaces > types pour les objets
- API responses : toujours Pydantic, jamais de dict raw
- Secrets : jamais dans le code, toujours depuis os.getenv()
- Tests : pytest-asyncio pour les routes async, factory-boy pour les fixtures

## Comptes de démo (dev uniquement)
Générés par `scripts/init_db.py` — voir `.env.example` pour la procédure.
