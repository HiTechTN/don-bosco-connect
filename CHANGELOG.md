# Changelog

## [2.2.0] — 2026-06

### 🌍 Internationalisation (i18n) — Bilinguisme FR/AR complet
- Système i18n initialisé avec i18next (import ES pour Vite, persistance localStorage)
- LoginPage : sous-titre, boutons, placeholders, messages d'erreur, comptes démo — tout bilingue avec RTL
- HomePage : refonte complète en landing page moderne et interactive (hero animé, compteurs, features, tech stack, CTA)
- Admin DashboardPage : accueil, 6 cartes stats, 2 graphiques, 3 pie charts, 4 métriques IA, activité récente — tout traduit
- Admin UsersPage : titre, formulaire, 30+ labels, pagination, filtres, confirm dialog — tout traduit
- Admin ClassesPage : formulaire, cartes, inscriptions, enrollment modal — tout traduit
- Admin AnnouncementsPage : filtres catégories, tableaux, statuts, actions — tout traduit
- Admin AnnouncementEditorPage : formulaire complet avec 5 catégories, 3 visibilités, tags, épinglage — tout traduit
- AnnouncementCard : layout RTL, formatDate localisé, badge épinglé traduit
- AnnounceDetailPage : complet bilingue avec ArrowLeft RTL, temps de lecture, partage
- LanguageSwitcher : persistance localStorage, dropdown accessible
- Clés de traduction : 200+ clés FR et AR pour toutes les pages publiques et admin

### 🎨 Landing Page Interactive
- Hero animé avec parallax scroll, orbes flottantes, texte gradient, indicateur de scroll
- Compteurs animés (framer-motion useSpring) pour les statistiques
- 6 cartes fonctionnalités avec hover effects et icônes glow
- Section démo interactive avec 4 profils cliquables
- Grille tech stack avec 6 technologies
- Section CTA avec gradient
- Animations FadeInWhenVisible pour chaque section

### 🧪 Tests & Qualité
- 29 tests unitaires AnnouncementEditorPage i18n (14 FR + 15 AR)
- 16 tests visuels Playwright FR↔AR pour 7 pages publiques + hero viewport
- 69 tests unitaires totaux — tous passent
- ESLint : 91 erreurs corrigées → 0 erreurs, 0 warnings
- TypeScript : strict, aucun erreur

### 🔧 Refactoring
- `formatDate` extrait dans `src/lib/utils.ts` avec paramètre `fallback` explicite
- Suppression des 3 implémentations dupliquées de `formatDate` (AnnouncementCard, AnnounceDetailPage, AnnouncementsPage)
- Nettoyage des imports inutilisés dans 15+ fichiers
- Correction des patterns `.then(r => r.data)` dans useAnnouncements.ts (apiClient retourne data directement)
- Correction du pattern `.toLowerCase().slice(0, -1)` pour les titres de formulaire (cassait en arabe)

### 🐛 Corrections de bugs critiques
- Import i18n manquant dans main.tsx (l'i18n ne s'initialisait pas)
- `require()` remplacé par imports ES statiques dans i18n.ts (compatibilité Vite ESM)
- Détection d'erreur login adaptée pour les messages backend français ET anglais

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
