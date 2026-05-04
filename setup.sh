#!/bin/bash
# Don Bosco Connect - Installation Automatique
# Usage: ./setup.sh [--docker | --local]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
succes() { echo -e "${GREEN}[SUCCES]${NC} $1"; }
error() { echo -e "${RED}[ERREUR]${NC} $1"; }

# Vérifications préalables
check_requirements() {
    info "Vérification des prérequis..."
    
    command -v docker >/dev/null 2>&1 || { error "Docker non installé"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { error "Docker Compose non installé"; exit 1; }
    
    succes "Prérequis OK"
}

# Installation locale
install_local() {
    info "Installation locale..."
    
    # Backend
    info "Configuration Backend..."
    cd backend
    cp env.example .env 2>/dev/null || true
    pip install -r requirements.txt 2>/dev/null || {
        info "Installation Python..."
        python3 -m pip install -r requirements.txt
    }
    
    # Configuration PostgreSQL
    info "Configuration PostgreSQL..."
    sudo -u postgres psql -c "CREATE USER donbosco WITH PASSWORD 'donbosco123';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE don_bosco OWNER donbosco;" 2>/dev/null || true
    
    # Migrations
    info "Migrations Django..."
    python3 manage.py migrate
    python3 manage.py createsuperuser --noinput --username admin --email admin@donbosco-connect.tn 2>/dev/null || true
    
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
    
    succes "Installation locale terminée!"
    echo ""
     echo "Pour démarrer:"
     echo "  Backend: cd backend && python3 manage.py runserver"
     echo "  Web: cd web && npm run dev"
     echo "  Mobile: cd mobile && npx expo start"
}

# Installation Docker
install_docker() {
    info "Installation via Docker..."
    
    check_requirements
    
    # Création .env pour Docker
    cat > .env.docker << EOL
DB_NAME=don_bosco
DB_USER=donbosco
DB_PASSORD=donbosco123
DB_HOST=db
DB_PORT=5432
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
EOL
    
     info "Démarrage des containeurs..."
     docker-compose up -d --build 2>/dev/null || docker compose up -d --build
     
     # Attendre que les services soient prêts
     info "Attente des services..."
     sleep 30
     
     # Migrations
     info "Migrations..."
     docker-compose exec -T backend python3 manage.py migrate 2>/dev/null || docker compose exec -T backend python3 manage.py migrate
     
     # Création superuser
     info "Création superutilisateur..."
     docker-compose exec -T backend python3 manage.py createsuperuser --noinput --username admin --email admin@donbosco-connect.tn 2>/dev/null || docker compose exec -T backend python3 manage.py createsuperuser --noinput --username admin --email admin@donbosco-connect.tn || true
    
    succes "Installation Docker terminée!"
    echo ""
    echo "Services disponibles:"
    echo "  Backend API: http://localhost:8000"
    echo "  Web: http://localhost:3000"
    echo "  Admin: http://localhost:8000/admin"
}

# Script principal
main() {
    echo "=========================================="
    echo "  Don Bosco Connect - Installation"
    echo "=========================================="
    echo ""
    
    case "$1" in
        --docker)
            install_docker
            ;;
        --local)
            install_local
            ;;
        *)
            echo "Usage: $0 [--docker | --local]"
            echo ""
            echo "Options:"
            echo "  --docker  : Installation via Docker Compose (recommandé)"
            echo "  --local   : Installation locale sur le système"
            exit 1
            ;;
    esac
}

main "$@"