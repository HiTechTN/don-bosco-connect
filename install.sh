#!/bin/bash
set -e

echo "=== Don Bosco Connect - Installation Automatique ==="
echo "Ce script installe tous les prérequis et lance le projet avec Docker."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "Docker non trouvé. Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Vérifier Docker Compose
if ! docker compose version &> /dev/null; then
    echo "Docker Compose non trouvé. Installation..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# Créer le dossier du projet
PROJECT_DIR=/opt/don-bosco-connect
mkdir -p $PROJECT_DIR/backend $PROJECT_DIR/web
cd $PROJECT_DIR

# Télécharger les fichiers nécessaires via curl (raw GitHub)
echo "Téléchargement des fichiers..."
curl -fsSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/master/docker-compose.yml -o docker-compose.yml

# Lancer avec Docker Compose
echo "Lancement des conteneurs..."
docker compose up -d --build

# Attendre que les services soient prêts
echo "Attente du démarrage des services..."
sleep 30

# Tester les endpoints
echo ""
echo "=== Test des endpoints ==="
echo "Backend (port 8000) :"
curl -s http://localhost:8000/admin/ | head -5 || echo "Backend pas encore prêt"

echo ""
echo "Frontend (port 3000) :"
curl -s http://localhost:3000/ | head -5 || echo "Frontend pas encore prêt"

echo ""
echo "=== Installation terminée ==="
echo "Accédez à l'application :"
echo "  - Frontend : http://localhost:3000"
echo "  - Backend API : http://localhost:8000/api/"
echo "  - Admin Django : http://localhost:8000/admin/"
