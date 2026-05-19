# Don Bosco Connect — Feuille de Route Déploiement

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-c96442?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/statut-prêt-059669?style=flat-square" alt="Statut"/>
</p>

---

## 📋 Prérequis

| Composant | Minimum | Recommandé |
|---|---|---|
| **CPU** | 4 cœurs (x86_64) | 8 cœurs |
| **RAM** | 16 Go | 32 Go |
| **Stockage** | 50 Go SSD | 100 Go NVMe |
| **OS** | Ubuntu 22.04+ / Debian 12 | Ubuntu 24.04 LTS |
| **Docker** | >= 24.0 | 27.x |
| **Réseau** | 100 Mbps local | 1 Gbps |

---

## 🗺️ Phase 1 : Infrastructure (Jour 1)

### Étape 1.1 — Préparation du serveur (2h)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Étape 1.2 — Clone & Configuration (1h)
```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
cp .env.example .env
nano .env
./scripts/setup.sh && ./scripts/start.sh
```

### Étape 1.3 — Vérification (30min)
```bash
docker ps
./scripts/healthcheck.sh
curl http://localhost:8000/health
curl http://localhost:8080
```

### Étape 1.4 — Seed données (15min)
```bash
docker exec donbosco_api python scripts/init_db.py
```

---

## 🗺️ Phase 2 : Configuration (Jour 2-3)

### SSL/TLS
```bash
# Auto-signé (test)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/donbosco.key \
  -out nginx/ssl/donbosco.crt

# Let's Encrypt (production)
sudo apt install certbot
certbot certonly --standalone -d donbosco.votre-domaine.tn
```

### Import données
- Création des comptes via interface Admin
- Format CSV : `email,password,role,first_name,last_name,phone,class`
- Création année scolaire et classes

### Tests de validation
- [ ] Connexion admin
- [ ] Création utilisateur
- [ ] Création classe
- [ ] Upload cours
- [ ] Saisie notes
- [ ] Saisie absences
- [ ] Envoi message
- [ ] Mentor IA
- [ ] Quiz adaptatif
- [ ] Gamification
- [ ] Export portfolio

---

## 🗺️ Phase 3 : Formation & Pilote (Semaine 2-3)

### Formation enseignants (2h)
1. Présentation plateforme (30min)
2. Connexion et navigation (20min)
3. Dépôt de cours et indexation IA (30min)
4. Carnet de notes et absences (30min)
5. Q/R (10min)

### Test pilote (1 semaine)
- 1 classe pilote (max 30 élèves)
- 2 enseignants volontaires
- Feedback quotidien

**Critères de succès :**
- [ ] 100% enseignants pilotes connectés
- [ ] 80% cours déposés
- [ ] Notes saisies à temps
- [ ] Aucun bug bloquant

---

## 🗺️ Phase 4 : Déploiement Complet (Mois 2)

| Semaine | Actions |
|---|---|
| 1 | Déploiement 3ème année (préparation Brevet) |
| 2 | Déploiement 2ème année |
| 3 | Déploiement 1ère année |
| 4 | Finalisation, tous niveaux opérationnels |

### Communication parents
- [ ] Email d'information
- [ ] Guide d'utilisation parents
- [ ] Réunion d'information (optionnelle)

---

## 🗺️ Phase 5 : Maintenance Continue

| Fréquence | Actions |
|---|---|
| **Quotidien** | Vérification logs (Grafana), sauvegarde auto (00:00) |
| **Hebdomadaire** | Revue alertes décrochage, nettoyage fichiers temporaires |
| **Mensuel** | Sauvegarde complète, rapport d'utilisation, mise à jour Docker |

---

## 🆘 Dépannage Rapide

### Connexion impossible
```bash
curl http://localhost:8000/health
docker exec donbosco_db psql -U donbosco_user -d donbosco -c "SELECT * FROM users LIMIT 5;"
docker logs donbosco_api --tail 50
```

### IA ne répond pas
```bash
docker exec donbosco_ollama ollama list
docker restart donbosco_ollama
```

### Performance lente
```bash
docker stats
docker exec donbosco_redis redis-cli FLUSHALL
docker restart donbosco_api
```

---

## 💰 Budget

### Investissement initial
| Poste | Coût |
|---|---|
| Serveur (existant) | 0 TND |
| Stockage SSD | ~200 TND |
| Certificat SSL | 0 TND |
| **Total** | **~200 TND** |

### Fonctionnement mensuel
| Poste | Coût |
|---|---|
| Électricité | ~50 TND |
| Maintenance IT | ~200 TND |
| **Total** | **~250 TND** |

**Économie vs SaaS : 75-87% (~12 000-24 000 TND/an économisés)**

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

## 📞 Contacts

| Situation | Contact | Délai |
|---|---|---|
| Bug bloquant | support@donbosco.tn | < 4h |
| Question technique | [GitHub Issues](https://github.com/HiTechTN/don-bosco-connect/issues) | < 24h |
| Demande d'évolution | Formulaire admin | < 48h |

---

*Généré le 19 mai 2026 · Version 2.0.0 · Don Bosco Connect — Éducation Intelligente*
