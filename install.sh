#!/bin/bash
# Don Bosco Connect - Installation Automatique
# Usage: curl -fsSL https://donbosco.tn/install.sh | bash
# Or: gh repo clone HiTechTN/don-bosco-connect && cd don-bosco-connect && ./install.sh
# For private repos: GITHUB_TOKEN=xxx curl -fsSL https://donbosco.tn/install.sh | bash

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
    # Check for token
    if [[ -n "$GITHUB_TOKEN" ]]; then
        git clone https://${GITHUB_TOKEN}@github.com/HiTechTN/don-bosco-connect.git
    elif command -v gh >/dev/null 2>&1; then
        gh repo clone HiTechTN/don-bosco-connect
    else
        git clone https://github.com/HiTechTN/don-bosco-connect.git
    fi
fi
success "Projet cloné!"

# Choix mode
echo ""
info "Choisissez le mode d'installation:"
echo "  1) Docker (recommandé)"
echo "  2) Local"
read -p "Votre choix (1/2): " choice

cd don-bosco-connect

# Auto-detect: use Docker if available, else local
if command -v docker >/dev/null 2>&1 && (command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1); then
    info "Docker détecté - Installation via Docker..."
    
    cat > .env.docker << EOL
DB_NAME=don_bosco
DB_USER=donbosco
DB_PASSWORD=donbosco123
DB_HOST=db
DB_PORT=5432
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
EOL
    
    docker-compose -f docker-compose.yml build 2>/dev/null || docker compose -f docker-compose.yml build
    docker-compose -f docker-compose.yml up -d 2>/dev/null || docker compose -f docker-compose.yml up -d
    
    info "Attente des services (30s)..."
    sleep 30
    
    docker-compose -f docker-compose.yml exec -T backend python manage.py migrate 2>/dev/null || docker compose -f docker-compose.yml exec -T backend python manage.py migrate
    docker-compose -f docker-compose.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@donbosco.tn --password admin123 2>/dev/null || true
    
    success "Installation Docker terminée!"
    echo ""
    echo "🌐 Services:"
    echo "   Backend API : http://localhost:8000"
    echo "   Web         : http://localhost:3000"
    echo "   Admin       : http://localhost:8000/admin"
    echo ""
    echo "📝 Logs: docker-compose logs -f"
    echo "🛑 Stop: docker-compose down"
else
    info "Docker non détecté - Installation locale..."
    
    cd backend
    pip install -r requirements.txt 2>/dev/null || pip3 install -r requirements.txt
    
    sudo -u postgres psql -c "CREATE USER donbosco WITH PASSWORD 'donbosco123';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE don_bosco OWNER donbosco;" 2>/dev/null || true
    
    python manage.py migrate 2>/dev/null || python3 manage.py migrate
    python manage.py createsuperuser --noinput --username admin --email admin@donbosco.tn --password admin123 2>/dev/null || true
    
    curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null || true
    ollama pull qwen2.5:3b 2>/dev/null || true
    
    cd ..
    
    cd web && npm install && cd ..
    cd mobile && npm install && cd ..
    
    success "Installation locale terminée!"
    echo ""
    echo "🚀 Démarrage:"
    echo "   cd backend && python manage.py runserver"
    echo "   cd web && npm run dev"
    echo "   cd mobile && npx expo start"
fi

success "Installation terminée avec succès!"
echo ""
echo "🎓 Don Bosco Connect est prêt à être utilisé!"
