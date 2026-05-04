#!/bin/bash
# Don Bosco Connect - Installation Automatique
# Usage: curl -fsSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/master/install.sh | bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "=========================================="
info "  Don Bosco Connect - Installation Automatique"
info "=========================================="
echo ""

# Détection OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    error "OS non supporté: $OSTYPE"
fi
info "OS détecté: $OS"

# Vérifications
info "Vérification des prérequis..."
command -v git >/dev/null 2>&1 || error "Git non installé"
command -v docker >/dev/null 2>&1 || error "Docker non installé"
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose non installé"
success "Prérequis OK"

# Clonage
info "Clonage du projet..."
if [[ -d "don-bosco-connect" ]]; then
    info "Mise à jour..."
    cd don-bosco-connect && git pull && cd ..
else
    git clone https://github.com/HiTechTN/don-bosco-connect.git
fi
success "Projet cloné!"

# Choix mode
echo ""
info "Choisissez le mode d'installation:"
echo "  1) Docker (recommandé)"
echo "  2) Local"
read -p "Votre choix (1/2): " choice

cd don-bosco-connect

case $choice in
    1)
        info "Installation via Docker..."
        
        # Création .env
        cat > .env.docker << EOL
DB_NAME=don_bosco
DB_USER=donbosco
DB_PASSWORD=donbosco123
DB_HOST=db
DB_PORT=5432
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
EOL
        
        info "Construction des images..."
        docker-compose -f docker-compose.yml build
        
        info "Démarrage des services..."
        docker-compose -f docker-compose.yml up -d
        
        info "Attente que les services soient prêts..."
        sleep 30
        
        info "Migrations..."
        docker-compose -f docker-compose.yml exec -T backend python manage.py migrate
        
        info "Création superutilisateur..."
        docker-compose -f docker-compose.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@donbosco.tn --password admin123 || true
        
        success "Installation Docker terminée!"
        echo ""
        echo "Services disponibles:"
        echo "  - Backend API: http://localhost:8000"
        echo "  - Web: http://localhost:3000"
        echo "  - Admin: http://localhost:8000/admin"
        echo "  - API Docs: http://localhost:8000/api/"
        ;;
    2)
        info "Installation locale..."
        
        # Backend
        info "Configuration Backend..."
        cd backend
        cp env.example .env 2>/dev/null || true
        pip install -r requirements.txt || pip3 install -r requirements.txt
        
        # PostgreSQL
        info "Configuration PostgreSQL..."
        sudo -u postgres psql -c "CREATE USER donbosco WITH PASSWORD 'donbosco123';" 2>/dev/null || true
        sudo -u postgres psql -c "CREATE DATABASE don_bosco OWNER donbosco;" 2>/dev/null || true
        
        # Migrations
        info "Migrations..."
        python manage.py migrate || python3 manage.py migrate
        
        # Superuser
        info "Superutilisateur..."
        python manage.py createsuperuser --noinput --username admin --email admin@donbosco.tn --password admin123 2>/dev/null || true
        
        # Ollama
        info "Installation Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null || info "Ollama déjà installé"
        ollama pull qwen2.5:3b 2>/dev/null || info "Modèle déjà présent"
        
        cd ..
        
        # Web
        info "Configuration Web..."
        cd web
        npm install
        cd ..
        
        # Mobile
        info "Configuration Mobile..."
        cd mobile
        npm install
        cd ..
        
        success "Installation locale terminée!"
        echo ""
        echo "Pour démarrer:"
        echo "  Backend: cd backend && python manage.py runserver"
        echo "  Web: cd web && npm run dev"
        echo "  Mobile: cd mobile && npx expo start"
        ;;
    *)
        error "Choix invalide"
        ;;
esac

success "Installation terminée avec succès!"
echo ""
echo "🎓 Don Bosco Connect est prêt à être utilisé!"
