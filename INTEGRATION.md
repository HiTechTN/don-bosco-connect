# 🔧 Guide d'Intégration - Don Bosco Connect v1.1.0

## 📋 Vue d'ensemble

Ce guide détaille l'installation, la configuration et le déploiement de Don Bosco Connect pour les administrateurs système et intégrateurs.

---

## 🖥️ Prérequis Système

### Serveur recommandé
| Composant | Minimum | Recommandé |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Stockage | 20 GB | 50+ GB SSD |
| OS | Ubuntu 22.04 / Debian 11 | Ubuntu 22.04 LTS |

### Logiciels requis
- **Docker** 24.0+ & **Docker Compose** 2.20+
- **Node.js** 22.x (pour build manuel)
- **Python** 3.11+ (pour dev local)
- **PostgreSQL** 15+ (si hors Docker)
- **Ollama** (pour l'IA locale)

---

## 🚀 Installation Rapide (Docker - Recommandé)

### 1. Cloner le projet
```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
```

### 2. Configuration environnement
```bash
cp backend/env.example backend/.env
nano backend/.env  # Modifier selon votre environnement
```

**Variables clés** :
```env
DB_NAME=don_bosco
DB_USER=donbosco
DB_PASSWORD=votre_mot_de_passe_securise
DB_HOST=db  # 'localhost' si hors Docker
OLLAMA_URL=http://ollama:11434  # ou http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
DEBUG=False  # En production
DJANGO_SECRET_KEY=votre_cle_secrete_50_caracteres
```

### 3. Lancer avec Docker Compose
```bash
docker-compose up -d --build
```

### 4. Initialiser la base de données
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 5. Télécharger le modèle IA
```bash
docker-compose exec ollama ollama pull qwen2.5:3b
```

---

## 🔐 Sécurité et Production

### Configuration Django (production)
```python
# backend/donbosco_connect/settings.py
DEBUG = False
ALLOWED_HOSTS = ['votre-domaine.com', 'localhost']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### HTTPS avec Nginx (exemple)
```nginx
server {
    listen 443 ssl;
    server_name donbosco-connect.tn;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;  # Web frontend
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:8000;  # Backend Django
        proxy_set_header Host $host;
    }

    location /media/ {
        proxy_pass http://localhost:8000/media/;
    }
}
```

---

## 🔧 Configuration des Rôles

### Admin (Superuser)
- Accès complet à `/admin/`
- Gestion des utilisateurs, cours, et configuration IA
- Création via `createsuperuser` ou interface admin

### Professeur
- Création via Admin ou API : `POST /api/accounts/teachers/`
- Assignation de cours et création de quiz
- Suivi des élèves

### Élève
- Inscription via API : `POST /api/accounts/students/`
- Niveau IA calculé automatiquement
- Progression sauvegardée

### Parent
- Lié à un ou plusieurs élèves via Admin
- Suivi des notes et progression
- Notifications

---

## 🤖 Configuration Ollama (IA)

### Modèles supportés
| Modèle | Taille | Usage |
|--------|--------|-------|
| qwen2.5:3b | 2.0 GB | Recommandé (rapide, précis) |
| llama3.2:3b | 2.0 GB | Alternative |
| phi3:mini | 1.1 GB | Léger, moins précis |

### Tester Ollama
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:3b",
  "prompt": "Expliquez la photosynthèse"
}'
```

### Changer de modèle
1. Modifiez `OLLAMA_MODEL` dans `.env`
2. Redémarrez le backend : `docker-compose restart backend`
3. Ou via Admin : Paramètres → Configuration IA

---

## 📊 Adaptive Learning (IA)

### Formule par défaut
```
Niveau = (Score_Quiz × 0.6) + (Vitesse_Réponse × 0.4)
```

### Personnalisation
Dans `backend/ai/services.py` :
```python
class AdaptiveLearningService:
    def calculate_level(self, quiz_score, response_time):
        # Modifiez les coefficients ici
        level = (quiz_score * 0.6) + (response_time * 0.4)
        return min(max(level, 1), 10)  # Entre 1 et 10
```

### API Endpoint
```bash
GET /api/ai/student/{id}/level  # Voir le niveau actuel
POST /api/ai/mentor/           # Poser une question à l'IA
```

---

## 🌍 Multilingue (i18n)

### Langues supportées
- **Français** (fr) - Par défaut
- **English** (en)
- **العربية** (ar) - RTL supporté

### Ajouter une langue
1. Créez le fichier : `web/src/i18n/[lang].ts`
2. Ajoutez les traductions
3. Modifiez `web/src/i18n/index.ts`
4. Rebuild : `cd web && npm run build`

### RTL (Arabe)
Le CSS s'adapte automatiquement via `dir="rtl"` dans `<html>`.

---

## 📱 Build et Déploiement Mobile

### Expo Go (développement)
```bash
cd mobile
npx expo start  # Scannez le QR code
```

### Build natif (production)
```bash
cd mobile
eas build -p android  # APK
eas build -p ios      # IPA (macOS requis)
```

### Configuration
Modifiez `mobile/app.json` :
```json
{
  "expo": {
    "name": "Don Bosco Connect",
    "slug": "don-bosco-connect",
    "version": "1.1.0"
  }
}
```

---

## 🔍 Dépannage (Troubleshooting)

### Erreurs courantes

**Database connection refused**
```bash
# Vérifiez PostgreSQL
sudo systemctl status postgresql
# Ou dans Docker
docker-compose logs db
```

**Ollama not responding**
```bash
# Vérifiez qu'Ollama tourne
curl http://localhost:11434/api/tags
# Redémarrez le conteneur
docker-compose restart ollama
```

**CORS errors (Web)**
```python
# Dans settings.py
CORS_ALLOW_ALL_ORIGINS = False  # En production
CORS_ALLOWED_ORIGINS = ['https://votre-domaine.com']
```

**Static files not loading**
```bash
# Collectez les fichiers statiques
python manage.py collectstatic --noinput
# Vérifiez nginx/Apache sert le dossier /static/
```

### Logs utiles
```bash
# Backend Django
docker-compose logs backend -f

# Web frontend (build)
cd web && npm run dev  # ou check dist/

# Ollama
docker-compose logs ollama -f

# PostgreSQL
docker-compose logs db -f
```

---

## 📈 Monitoring et Maintenance

### Backups (PostgreSQL)
```bash
# Backup
docker-compose exec db pg_dump -U donbosco don_bosco > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U donbosco don_bosco < backup_20260504.sql
```

### Mise à jour
```bash
git pull origin master
docker-compose down
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
```

### Performance
- Utilisez **Redis** pour le cache (déjà dans docker-compose.yml)
- Configurez **Gunicorn** avec plusieurs workers :
  ```bash
  gunicorn donbosco_connect.wsgi:application --workers 4
  ```

---

## 📞 Support

- **Email** : contact@donbosco-connect.tn
- **GitHub Issues** : https://github.com/HiTechTN/don-bosco-connect/issues
- **Wiki** : https://github.com/HiTechTN/don-bosco-connect/wiki
- **Documentation Ollama** : https://github.com/ollama/ollama

---

**Version** : 1.1.0  
**Dernière mise à jour** : Mai 2026  
**Licence** : MIT  
**Auteur** : HiTech TN