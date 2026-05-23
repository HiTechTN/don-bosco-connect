# Changelog

## [2.1.0] — 2026-05

### 🔐 Sécurité
- Suppression de .env.production de l'historique git (git-filter-repo)
- Ajout .env.production et .env.*.local au .gitignore
- Génération automatique des secrets dans setup.sh
- Backup PostgreSQL automatisé (02h00 quotidien, retention 30j)
- Scan automatique Bandit + detect-secrets en CI

### 🔌 Architecture
- Création de 15 hooks TanStack Query v5 couvrant tous les domaines API
- Client API fetch-based (apiClient.ts) avec refresh token automatique
- QueryClient configuré avec staleTime, retry policy, cache management
- Harmonisation du stockage des tokens (localStorage partout)

### ⚡ Performance
- Cache Redis des embeddings Ollama par hash SHA256 (TTL 24h)
- Cache Redis des emplois du temps (TTL 1h)
- Streaming SSE pour l'assistant IA (réduction latency)

### 🔔 Temps réel
- WebSocket FastAPI + Redis Pub/Sub pour notifications utilisateur
- Hook React useWebSocket.ts avec reconnexion exponentielle
- Hook React useAIStream.ts pour streaming SSE de l'IA
- Nginx configuré pour WebSocket longue durée

### 🧪 Qualité
- Couverture tests backend : fail-under 70% en CI
- CI enrichie : Redis service, TypeScript strict, ESLint max-warnings, security scan
- Migration DB vérifiée par Alembic check dans CI
- Tests existants pour auth, absences, AI, analytics, courses, evaluations, gamification, messages, notifications

### 📋 Documentation
- Création de CLAUDE.md pour le contexte des agents de coding
- Mise à jour de .env.example avec documentation complète
- scripts/validate.sh pour validation pré-déploiement

## [2.0.0] — 2026-04
- Version initiale de Don Bosco Connect
