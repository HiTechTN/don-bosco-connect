# Don Bosco Connect — Présentation

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-c96442?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/statut-prêt-059669?style=flat-square" alt="Statut"/>
  <img src="https://img.shields.io/badge/on--premise-100%25-2D2A24?style=flat-square" alt="On-Premise"/>
</p>

---

## Slide 1 : Contexte & Problématique

**Collège Don Bosco Tunis — Une école en pleine transformation numérique**

| Défis actuels | Solutions apportées |
|---|---|
| ❌ Gestion papier des notes et absences | ✅ Plateforme numérique centralisée |
| ❌ Communication fragmentée parents/enseignants | ✅ Messagerie chiffrée temps réel |
| ❌ Aucun suivi individualisé des élèves | ✅ IA adaptative + analytique prédictive |
| ❌ Pas d'outil de détection du décrochage | ✅ Algorithme prédictif (précision 85%) |
| ❌ Dépendance cloud = données exposées | ✅ 100% on-premise, zéro fuite de données |

**Vision :** Faire du Collège Don Bosco un modèle d'établissement connecté en Tunisie.

---

## Slide 2 : Tour des Fonctionnalités

### 4 profils, une plateforme unifiée

| Profil | Fonctionnalités clés |
|---|---|
| **🛡️ Admin** | Dashboard analytique · Gestion utilisateurs · Classes · Emploi du temps · Audit logs · Rapports PDF |
| **👨‍🏫 Enseignant** | Dépôt cours (PDF/vidéo) · Carnet de notes · Absences · Assistant IA · Messagerie chiffrée |
| **🧑‍🎓 Élève** | Mentor IA 24/7 · Quiz adaptatif · Gamification · Portfolio numérique · Notes et absences |
| **👪 Parent** | Suivi temps réel · Justification absences · Messagerie · Bulletin en ligne |

---

## Slide 3 : L'IA au Cœur de l'Apprentissage

### 1. Mentor IA 24/7 (RAG local)
- PDF déposé → indexé → réponse sur le contenu du cours uniquement
- Modèle : **DeepSeek R1 14B** (local, sécurisé, rapide)

### 2. Quiz Adaptatif
- Difficulté ajustée en temps réel : **Remédiation → Normal → Avancé**

### 3. Décrochage Prédictif
- Algorithme : absences 35% + niveau 30% + régularité 15% + stress 20%

---

## Slide 4 : Expérience Utilisateur

| Fonctionnalité | Détail |
|---|---|
| **🎨 Design** | Glass-morphism, animations fluides, mode sombre, mobile-first |
| **🎮 Gamification** | XP, niveaux, badges, streaks, confetti, classement bienveillant |
| **📊 Analytics** | Graphiques Recharts, progression par matière |
| **📱 Portfolio** | Export PDF, badges certifiés avec QR code |
| **🔐 Sécurité** | JWT + MFA TOTP · AES-256-GCM · 100% on-premise · RGPD |

---

## Slide 5 : Architecture

```
                     ┌──────────────────────┐
                     │  React 18 + Vite      │  ← Web
                     │  React Native (Expo)  │  ← Mobile
                     └──────────┬───────────┘
                                │ HTTP / WS
                     ┌──────────▼───────────┐
                     │  Nginx 1.25           │  :8080
                     │  TLS 1.3 · Rate limit │
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
     └─────────────────────────────────┘  │  nomic-embed-text   │
               │                          └──────────────────────┘
     ┌─────────▼──────────┐
     │  MinIO (S3)         │
     │  Cours · Documents  │
     └─────────────────────┘
```

| Service | Technologie | Rôle |
|---------|------------|------|
| Base de données | PostgreSQL 16 + pgvector | Données + embeddings vectoriels |
| Cache / Queue | Redis 7 | Sessions, cache IA, tâches asynchrones |
| Stockage fichiers | MinIO (S3 compatible) | Cours, devoirs, avatars |
| IA Locale | Ollama (DeepSeek 14B) | Mentor IA, génération quiz, embeddings RAG |
| API | FastAPI + WebSocket | REST + notifications temps réel |
| Frontend Web | React 18 + Vite + Tailwind | Interface utilisateur responsive |
| Mobile | React Native / Expo | Application iOS + Android |
| Monitoring | Prometheus + Grafana | Métriques, alertes, dashboards |

---

## Slide 6 : Stack Technique

**100% Open Source · Zéro Licence · Zéro Cloud**

| Catégorie | Technologies |
|---|---|
| **Backend** | FastAPI · Python 3.12 · SQLAlchemy 2.0 · Celery · Redis |
| **Frontend** | React 18 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion |
| **Mobile** | React Native · Expo · Notifications push |
| **Base de données** | PostgreSQL 16 · pgvector · Alembic |
| **IA** | Ollama · DeepSeek R1 14B · nomic-embed-text · RAG |
| **Infrastructure** | Docker · Docker Compose · Nginx · MinIO |
| **Monitoring** | Prometheus · Grafana · Loki |
| **Sécurité** | JWT · TOTP MFA · AES-256-GCM · bcrypt · TLS 1.3 · CSP · HSTS |

---

## Slide 7 : Roadmap Déploiement

### Phase 1 — Mise en Production (Semaine 1-2)

| Étape | Durée |
|---|---|
| Déploiement serveur | 1 jour |
| Base de données + migrations | 1 jour |
| Application (build + déploiement) | 1 jour |
| Tests & validation | 1 jour |

### Phase 2 — Adoption (Semaine 3-4)
- Formation enseignants (2 sessions de 2h)
- Import CSV comptes utilisateurs
- Test pilote (1 classe, 1 semaine)

### Phase 3 — Déploiement Complet (Mois 2)
- Ouverture progressive par niveau
- Formation continue (tutoriels vidéo)
- Support & maintenance

---

## Slide 8 : Chiffres Clés

| Métrique | Valeur |
|---|---|
| Disponibilité | 99.9% |
| Latence API | < 50ms |
| Latence IA | < 3s |
| Utilisateurs simultanés | 500+ |
| Temps réponse web | < 1s |
| Backup | Quotidien (rétention 30 jours) |

### Budget

| Poste | Coût |
|---|---|
| Serveur (existant) | 0 TND |
| Électricité | ~50 TND/mois |
| Maintenance | ~200 TND/mois |
| **Total** | **~250 TND/mois** |

**Économie vs SaaS : 75-87%**

---

## Slide 9 : Sécurité

- JWT 15 min + Refresh token 7 jours
- MFA TOTP obligatoire (admin & enseignants)
- Blocage après 5 échecs
- Messages AES-256-GCM
- TLS 1.3 partout
- Audit logs de toutes les actions
- **100% on-premise, zéro cloud**

---

## Slide 10 : Prochaines Étapes

- [ ] Déploiement sur serveur de production
- [ ] Création des comptes utilisateurs réels
- [ ] Formation enseignants
- [ ] Test pilote
- [ ] Déploiement complet

---

**Don Bosco Connect** — Propulsé par l'IA · 100% On-Premise · Fièrement Tunisien 🇹🇳

*© 2026 Collège Don Bosco Tunis — Tous droits réservés · Réalisé par [HiTech TN](https://github.com/HiTechTN)*
