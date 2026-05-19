# Guide d'utilisation — Don Bosco Connect

Plateforme éducative sur-mesure pour le Collège Don Bosco Tunis.

---

## 1. Accès à la plateforme

### 1.1 URLs

| Service | Adresse |
|---------|---------|
| Frontend (Web) | `http://localhost:8081` |
| API (docs Swagger) | `http://localhost:8002/docs` |
| MinIO Console | `http://localhost:9003` |
| Flower (file Celery) | `http://localhost:5556` |
| Grafana | `http://localhost:3004` |

### 1.2 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Administrateur | `admin@donbosco.tn` | `admin123!` |
| Enseignant | `karim.hamdi@donbosco.tn` | `teacher123!` |
| Élève | `adam.slim@donbosco.tn` | `student123!` |
| Parent | `ahmed.slim@parent.tn` | `parent123!` |

---

## 2. Rôles et permissions

### Administrateur
Accès complet à toutes les fonctionnalités :
- Gestion des utilisateurs (CRUD)
- Gestion des classes, matières, emplois du temps
- Création d'années scolaires et d'événements
- Consultation des logs d'audit
- Tableaux de bord analytics complets

### Enseignant
Gestion pédagogique :
- Création et gestion des cours (dépôt de fichiers PDF, vidéos, documents)
- Création d'évaluations et saisie des notes
- Enregistrement des absences
- Génération de quiz par IA
- Messagerie chiffrée avec parents et administration
- Assistant IA pour le tutorat

### Élève
Apprentissage et suivi :
- Consultation des notes publiées
- Consultation des absences
- Emploi du temps
- Participation aux quiz adaptatifs
- Assistant IA (chat RAG sur le contenu des cours)
- Profil de gamification (XP, badges, classement)

### Parent
Suivi scolaire :
- Notes et absences des enfants liés
- Messagerie chiffrée avec les enseignants
- Tableau de bord parent

---

## 3. Fonctionnalités principales

### 3.1 Authentification et sécurité
- **Connexion** par email + mot de passe
- **JWT** : access token (15 min) + refresh token (7 jours)
- **MFA** : authentification à deux facteurs (TOTP) obligatoire pour admin et enseignants
- **Verrouillage** : 5 échecs de connexion → 15 minutes de blocage
- **Chiffrement** : messages AES-256-GCM au repos

### 3.2 Gestion des cours
1. Aller dans la section **Cours** (enseignant/admin)
2. Cliquer sur **Nouveau cours**
3. Remplir : titre, description, matière, classe, chapitre
4. Déposer des fichiers (PDF, DOCX, vidéos, images)
5. **Publier** le cours pour le rendre visible aux élèves

### 3.3 Assistant IA (Mentor IA)
L'assistant utilise le **RAG** (Retrieval-Augmented Generation) :
1. L'élève pose une question sur un cours
2. Le système cherche dans les fichiers du cours (similarité vectorielle)
3. Le LLM (Qwen 2.5) génère une réponse basée uniquement sur le contenu du cours
4. La réponse est diffusée en temps réel (SSE)

**Pour les enseignants** : génération automatique de quiz à partir du contenu d'un cours.

### 3.4 Quiz adaptatifs
- Les questions sont générées par IA selon le niveau de l'élève
- Le niveau s'ajuste automatiquement : **remediation** → **normal** → **advanced**
- Le score tient compte de la rapidité et de l'historique

### 3.5 Gamification
- **XP** : gagné en utilisant l'IA, en complétant des quiz, etc.
- **Niveaux** : montée en niveau automatique
- **Badges** (7 disponibles) : Première Connexion, Maître des Quiz, 7 Jours d'Affilée, etc.
- **Streaks** : jours consécutifs d'activité
- **Classement** : global ou par classe (non-anxiogène)
- **Décrochage prédictif** : algorithme basé sur absences (35%), niveau (30%), régularité (15%)

### 3.6 Messagerie chiffrée
- Conversations par thread
- Chiffrement AES-256-GCM de chaque message
- Participants : parents, enseignants, administration
- Notifications en temps réel via WebSocket

### 3.7 Notifications en temps réel
- Types : absence, note publiée, message, réponse IA, quiz disponible, événement, alerte décrochage
- Diffusion via WebSocket (`/ws/v1/notifications`)

### 3.8 Évaluations et notes
- Types : Quiz, Devoir, Examen, Contrôle, Oral, Projet
- Les enseignants créent l'évaluation, saisissent les notes, puis **publient** pour les élèves
- Les élèves ne voient que leurs propres notes publiées

### 3.9 Absences
- Types : Absence, Retard, Exclusion
- Flux de justification : en attente → justifié / non justifié
- Notification automatique aux parents

---

## 4. Administration

### 4.1 Gestion des utilisateurs
- Création, modification, désactivation (suppression logique)
- Filtre par rôle
- Recherche

### 4.2 Année scolaire
- Création d'années scolaires
- Une seule année active à la fois

### 4.3 Classes et inscriptions
- Création de classes avec professeur principal
- Capacité maximale (défaut : 30 élèves)
- Inscription / désinscription des élèves

### 4.4 Matières
- Nom bilingue (français + arabe)
- Code unique, coefficient, code couleur

### 4.5 Emploi du temps
- Création de créneaux par classe
- Détection de chevauchements

### 4.6 Logs d'audit
- Toutes les actions admin sont journalisées
- Consultation avec filtres (action, ressource, date)

---

## 5. Analyse et rapports

### Dashboard Admin
- Nombre d'utilisateurs par rôle
- Cours créés
- Notes des 30 derniers jours
- Conversations IA

### Dashboard Enseignant
- Cours, évaluations, moyenne des notes
- Absences enregistrées

### Distribution des notes
- Histogramme avec intervalles configurables

### Statistiques IA
- Nombre de conversations, messages utilisateurs, tokens moyens

### Bulletin de l'élève
- API JSON : notes par matière avec coefficients

---

## 6. API

Documentation interactive : `http://localhost:8002/docs`

### Endpoints principaux

| Groupe | Préfixe |
|--------|---------|
| Authentification | `/api/v1/auth/*` |
| Utilisateurs | `/api/v1/users/*` |
| Cours | `/api/v1/courses/*` |
| Évaluations | `/api/v1/evaluations/*` |
| Absences | `/api/v1/absences/*` |
| Messagerie | `/api/v1/messages/*` |
| IA | `/api/v1/ai/*` |
| Gamification | `/api/v1/gamification/*` |
| Analytics | `/api/v1/analytics/*` |
| Audits | `/api/v1/audit/*` |
| Health | `/health` |

---

## 7. Maintenance

```bash
# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart api

# Sauvegarder la base de données
./scripts/backup.sh

# Restaurer
docker compose exec -T db psql -U donbosco_user -d donbosco < sauvegarde.sql

# Arrêter tous les services
docker compose down

# Démarrer tous les services
docker compose up -d
```

### Variables d'environnement clés (`.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Clé JWT (32 bytes hex) |
| `ENCRYPTION_KEY` | Clé de chiffrement AES |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `REDIS_PASSWORD` | Mot de passe Redis |
| `MINIO_ROOT_PASSWORD` | Mot de passe MinIO |
| `OLLAMA_BASE_URL` | URL du service Ollama |
| `CORS_ORIGINS` | Origines autorisées CORS |
| `AI_DAILY_TOKEN_LIMIT_PER_STUDENT` | Limite tokens IA par jour |

---

## 8. Dépannage

### L'API ne répond pas
```bash
docker compose logs api --tail=50
```

### La base de données est corrompue
```bash
# Réinitialiser complètement
docker compose down -v
docker compose up -d
# Puis relancer les migrations et le seed
```

### Ollama ne répond pas
- Vérifier que le conteneur ollama est en bonne santé
- Vérifier `OLLAMA_BASE_URL` dans `.env`

### Les fichiers ne s'affichent pas
- Vérifier MinIO Console (`http://localhost:9003`)
- Identifiants : `donbosco_admin` / mot de passe dans `.env`
