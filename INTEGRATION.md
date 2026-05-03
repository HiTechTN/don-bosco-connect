# Don Bosco Connect - Guide d'Intégration Système

## 🔧 Vue d'ensemble

Don Bosco Connect est une plateforme éducative complète avec :
- Backend Django + Django REST Framework
- Frontend Web React + Electron
- Application Mobile React Native (Expo)
- Intelligence Artificielle avec Ollama (Qwen 2.5)

## 🚀 Prérequis Système

| Composant | Version Min. | Recommandé |
|-----------|------------|-----------|
| Python | 3.11+ | 3.11 |
| Node.js | 22+ | 22 LTS |
| PostgreSQL | 15+ | 16 |
| Ollama | 0.1.0+ | Dernière |

## 📦 Installation Backend

### 1. Cloner le dépôt
```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect/backend
```

### 2. Configuration environnement
```bash
cp env.example .env
# Éditer .env avec vos paramètres
```

### 3. Installation dépendances
```bash
pip install -r requirements.txt
# ou avec Poetry
poetry install
```

### 4. Configuration PostgreSQL
```sql
CREATE DATABASE don_bosco;
CREATE USER donbosco WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE don_bosco TO donbosco;
```

### 5. Migrations
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Lancer le serveur
```bash
python manage.py runserver 0.0.0.0:8000
```

## 🤖 Configuration Ollama (IA)

### 1. Installer Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Télécharger le modèle
```bash
ollama pull qwen2.5:7b
# ou qwen2.5:3b pour moins de ressources
```

### 3. Vérifier
```bash
curl http://localhost:11434/api/tags
```

## 🌐 Configuration Frontend Web

### 1. Installation
```bash
cd ../web
npm install
```

### 2. Configuration
```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

### 3. Développement
```bash
npm run dev
# Accès: http://localhost:5173
```

### 4. Build production
```bash
npm run build
npx serve dist
```

### 5. Electron (Desktop)
```bash
npm run electron:dev
```

## 📱 Configuration Mobile

### 1. Installation
```bash
cd ../mobile
npm install
```

### 2. Configuration
```bash
# .env
EXPO_PUBLIC_API_URL=http://votre-ip:8000/api
```

### 3. Développement
```bash
npx expo start
# Scanner le QR code avec Expo Go
```

### 4. Build Android
```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

## 🔐 Configuration PostgreSQL + pgvector

### Installation pgvector
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-15-pgvector

# macOS
brew install pgvector
```

### Activation extension
```sql
\c don_bosco
CREATE EXTENSION IF NOT EXISTS vector;
```

## 🚦 Tests

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd web
npm test
```

## 📊 Structure API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/accounts/` | REST | Gestion utilisateurs |
| `/api/courses/` | REST | Gestion cours |
| `/api/assignments/` | REST | Devoirs/Quiz |
| `/api/ai/` | REST | Services IA |

## 🔒 Sécurité

1. **HTTPS** obligatoire en production
2. **Variables env** : jamais en git
3. **CORS** : configurer `CORS_ALLOWED_ORIGINS`
4. **Secrets** : utiliser GitHub Secrets pour CI/CD

## 📈 Monitoring

- Logs : `tail -f logs/django.log`
- Métriques : intégrer Prometheus/Grafana
- Santé DB : `pg_isready`

## 🆘 Support

- Issues : https://github.com/HiTechTN/don-bosco-connect/issues
- Email : contact@donbosco.tn