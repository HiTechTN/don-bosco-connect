# Feuille de Route Déploiement
## Don Bosco Connect — Mise en Production

---

## 📋 Prérequis Techniques

### Serveur (On-Premise)
| Composant | Minimum | Recommandé |
|---|---|---|
| **CPU** | 4 cœurs (x86_64) | 8 cœurs |
| **RAM** | 16 Go | 32 Go |
| **Stockage** | 50 Go SSD | 100 Go NVMe |
| **OS** | Ubuntu 22.04+ / Debian 12 | Ubuntu 24.04 LTS |
| **Docker** | >= 24.0 | 27.x |
| **Réseau** | 100 Mbps local | 1 Gbps |

### Réseau
- Adresse IP fixe (ex: 192.168.0.X)
- DNS configuré (donbosco.local ou sous-domaine)
- Ports ouverts : 443 (HTTPS), 80 (HTTP redir)

---

## 🗺️ Phase 1 : Infrastructure (Jour 1)

### Étape 1.1 — Préparation du serveur (2h)
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Redémarrer la session
exit
```

### Étape 1.2 — Clone & Configuration (1h)
```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect

# Configuration
cp .env.example .env
nano .env  # Modifier les mots de passe

# Lancement automatique
./scripts/setup.sh && ./scripts/start.sh
```

### Étape 1.3 — Vérification des services (30min)
```bash
# Vérifier que tous les conteneurs tournent
docker ps

# Vérifier la santé des services
./scripts/healthcheck.sh

# Tester l'API
curl http://localhost:8000/health

# Tester le frontend
curl http://localhost:8080
```

### Étape 1.4 — Seed des données (15min)
```bash
# Injecter les données de démonstration
docker exec donbosco_api python scripts/init_db.py
```

---

## 🗺️ Phase 2 : Configuration & Tests (Jour 2-3)

### Étape 2.1 — Configuration SSL/TLS
```bash
# Option A : Auto-signé (test)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/donbosco.key \
  -out nginx/ssl/donbosco.crt

# Option B : Let's Encrypt (production)
sudo apt install certbot
certbot certonly --standalone -d donbosco.votre-domaine.tn
```

### Étape 2.2 — Import des données réelles
```bash
# Création des comptes utilisateurs
# Interface Admin > Utilisateurs > Importer CSV

# Format CSV accepté:
# email,password,role,first_name,last_name,phone,class

# Création de l'année scolaire
# Interface Admin > Classes > Année scolaire

# Création des classes et inscriptions
# Interface Admin > Classes > Classes > Inscrire élèves
```

### Étape 2.3 — Tests de validation
- [ ] ✅ Connexion admin
- [ ] ✅ Création utilisateur
- [ ] ✅ Création classe
- [ ] ✅ Upload cours
- [ ] ✅ Saisie notes
- [ ] ✅ Saisie absences
- [ ] ✅ Envoi message
- [ ] ✅ Mentor IA
- [ ] ✅ Quiz
- [ ] ✅ Gamification
- [ ] ✅ Export portfolio

---

## 🗺️ Phase 3 : Formation & Pilote (Semaine 2-3)

### Étape 3.1 — Formation des enseignants (Session 1)
**Durée :** 2 heures

**Ordre du jour :**
1. Présentation de la plateforme (30min)
2. Connexion et navigation (20min)
3. Dépôt de cours et indexation IA (30min)
4. Carnet de notes et absences (30min)
5. Questions/Réponses (10min)

### Étape 3.2 — Test pilote
**Durée :** 1 semaine

**Protocole :**
1. Sélectionner 1 classe pilote (max 30 élèves)
2. 2 enseignants volontaires
3. Utilisation quotidienne
4. Feedback journalier

**Critères de succès :**
- [ ] 100% des enseignants pilotes connectés
- [ ] 80% des cours déposés
- [ ] Notes saisies à temps
- [ ] Aucun bug bloquant

### Étape 3.3 — Ajustements post-pilote
- Correction des bugs remontés
- Ajustement de l'interface selon feedback
- Optimisation des performances

---

## 🗺️ Phase 4 : Déploiement Complet (Mois 2)

### Planning de déploiement

| Semaine | Actions |
|---|---|
| 1 | Déploiement 3ème année (préparation Brevet) |
| 2 | Déploiement 2ème année |
| 3 | Déploiement 1ère année |
| 4 | Finalisation, tous niveaux opérationnels |

### Communication parents
- [ ] Email d'information aux parents
- [ ] Guide d'utilisation pour les parents
- [ ] Réunion d'information (optionnelle)

---

## 🗺️ Phase 5 : Maintenance Continue

### Quotidien
- Vérification des logs (Grafana)
- Sauvegarde automatique (00:00)

### Hebdomadaire
- Revue des alertes de décrochage
- Nettoyage des fichiers temporaires
- Mise à jour des modèles IA

### Mensuel
- Sauvegarde complète (base + fichiers)
- Rapport d'utilisation
- Mise à jour Docker images
- Revue de sécurité

---

## 🔧 Procédures de Dépannage Rapide

### Problème : Impossible de se connecter
```bash
# 1. Vérifier que l'API tourne
curl http://localhost:8000/health

# 2. Vérifier la base de données
docker exec donbosco_db psql -U donbosco_user -d donbosco -c "SELECT * FROM users LIMIT 5;"

# 3. Vérifier les logs
docker logs donbosco_api --tail 50

# 4. Réinitialiser le seed si nécessaire
docker exec donbosco_api python scripts/init_db.py
```

### Problème : L'IA ne répond pas
```bash
# 1. Vérifier Ollama
docker exec donbosco_ollama ollama list

# 2. Redémarrer le service
docker restart donbosco_ollama
```

### Problème : Performance lente
```bash
# 1. Vérifier les ressources
docker stats

# 2. Vider le cache Redis
docker exec donbosco_redis redis-cli FLUSHALL

# 3. Redémarrer l'API
docker restart donbosco_api
```

---

## 📊 Budget Détail

### Investissement initial
| Poste | Coût | Notes |
|---|---|---|
| Serveur (existant) | 0 TND | Réutilisation HP Proliant |
| Stockage SSD | ~200 TND | 500Go NVMe si nécessaire |
| Certificat SSL | 0 TND | Let's Encrypt gratuit |
| **Total** | **~200 TND** | |

### Fonctionnement mensuel
| Poste | Coût (TND) |
|---|---|
| Électricité | ~50 |
| Maintenance IT | ~200 |
| **Total** | **~250** |

### Économies vs Cloud
| Solution | Coût annuel |
|---|---|
| Don Bosco Connect | ~3 000 TND |
| SaaS gestion scolaire | ~12 000-24 000 TND |
| Économie réalisée | **75-87%** |

---

## ✅ Checklist Finale

### Pré-déploiement
- [ ] Serveur prêt (OS, Docker, réseau)
- [ ] DNS configuré
- [ ] .env configuré (mots de passe sécurisés)
- [ ] Backup initial configuré
- [ ] Monitoring configuré

### Post-déploiement
- [ ] Tests fonctionnels OK
- [ ] API docs accessibles
- [ ] Grafana accessible
- [ ] Sauvegarde fonctionnelle
- [ ] Notifications emails configurées

### Documentation
- [ ] Guide utilisateur distribué
- [ ] Contacts support communiqués
- [ ] Procédure d'urgence documentée

---

## 📞 Contacts d'Urgence

| Situation | Contact | Délai réponse |
|---|---|---|
| Bug bloquant | support@donbosco.tn | < 4h |
| Question technique | issues GitHub | < 24h |
| Demande d'évolution | Formulaire admin | < 48h |

---

**Document généré le 19 mai 2026**  
**Version 2.0.0**  
*Don Bosco Connect — Éducation Intelligente*
