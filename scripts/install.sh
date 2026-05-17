#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Installateur automatique
# Usage: curl -sSL https://raw.githubusercontent.com/HiTechTN/don-bosco-connect/main/scripts/install.sh | bash
# ──────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="https://github.com/HiTechTN/don-bosco-connect.git"
REPO_DIR="don-bosco-connect"
BRANCH="main"

PASS_COLOR='\033[0;32m'
INFO_COLOR='\033[0;34m'
WARN_COLOR='\033[1;33m'
ERROR_COLOR='\033[0;31m'
NC='\033[0m'

pass_msg()  { echo -e "${PASS_COLOR}✅ $1${NC}"; }
info_msg()  { echo -e "${INFO_COLOR}ℹ️  $1${NC}"; }
warn_msg()  { echo -e "${WARN_COLOR}⚠️  $1${NC}"; }
error_msg() { echo -e "${ERROR_COLOR}❌ $1${NC}"; }

# ── Bannière ────────────────────────────────────────────
echo ""
echo -e "${INFO_COLOR}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${INFO_COLOR}║   Don Bosco Connect — Installation automatique  ║${NC}"
echo -e "${INFO_COLOR}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── Détection OS ────────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"
info_msg "Système détecté : $OS $ARCH"

# ── Vérifier/Créer le Docker (Docker ou Podman) ────────
DOCKER_CMD=""
DOCKER_COMPOSE_CMD=""

# Détection Podman (socket Docker-compatible)
if command -v podman &>/dev/null && podman info &>/dev/null 2>&1; then
    DOCKER_CMD="podman"
    DOCKER_COMPOSE_CMD="podman-compose"

elif command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    DOCKER_CMD="docker"
    if docker compose version &>/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        DOCKER_COMPOSE_CMD="docker-compose"
    fi

else
    warn_msg "Docker/Podman introuvable. Installation en cours..."

    # macOS
    if [[ "$OS" == "Darwin" ]]; then
        if ! command -v brew &>/dev/null; then
            info_msg "Installation de Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install --cask docker
        open -a Docker
        info_msg "⏳ Attente de Docker Desktop..."
        until docker info &>/dev/null 2>&1; do sleep 2; done
        DOCKER_CMD="docker"
        DOCKER_COMPOSE_CMD="docker compose"

    # Linux
    elif [[ "$OS" == "Linux" ]]; then
        # Détecter le gestionnaire de paquets
        if command -v apt-get &>/dev/null; then
            info_msg "Debian/Ubuntu détecté. Installation de Docker..."
            sudo apt-get update -qq
            sudo apt-get install -y -qq ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
            sudo chmod a+r /etc/apt/keyrings/docker.asc
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
            sudo apt-get update -qq
            sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
            sudo usermod -aG docker "$USER"

        elif command -v dnf &>/dev/null; then
            info_msg "Fedora/RHEL détecté. Installation de Docker..."
            sudo dnf -y install dnf-plugins-core
            sudo dnf-3 config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin
            sudo systemctl enable --now docker
            sudo usermod -aG docker "$USER"

        elif command -v pacman &>/dev/null; then
            info_msg "Arch Linux détecté. Installation de Docker..."
            sudo pacman -S --noconfirm docker docker-compose
            sudo systemctl enable --now docker
            sudo usermod -aG docker "$USER"

        else
            error_msg "Gestionnaire de paquets non reconnu."
            error_msg "Merci d'installer Docker manuellement : https://docs.docker.com/engine/install/"
            exit 1
        fi

        DOCKER_CMD="docker"
        DOCKER_COMPOSE_CMD="docker compose"
        warn_msg "Redémarrez votre session ou exécutez 'newgrp docker' pour utiliser Docker sans sudo."

    else
        error_msg "OS non supporté : $OS"
        exit 1
    fi

    info_msg "✅ Docker installé avec succès."
fi

pass_msg "Docker détecté : $DOCKER_CMD ($DOCKER_COMPOSE_CMD)"

# ── Cloner le dépôt ─────────────────────────────────────
if [ -d "$REPO_DIR" ]; then
    warn_msg "Le répertoire $REPO_DIR existe déjà. Mise à jour..."
    cd "$REPO_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
else
    info_msg "Clonage du dépôt $REPO_URL..."
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL"
    cd "$REPO_DIR"
fi
pass_msg "Dépôt cloné : $(pwd)"

# ── Créer .env ──────────────────────────────────────────
if [ ! -f .env ]; then
    info_msg "Génération du fichier .env..."
    cp .env.example .env

    # Générer les clés secrètes
    if command -v python3 &>/dev/null; then
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
        ENCRYPTION_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
        DB_PASS=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")
        REDIS_PASS=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")
        MINIO_PASS=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")
        GRAFANA_PASS=$(python3 -c "import secrets; print(secrets.token_urlsafe(12))")
    elif command -v openssl &>/dev/null; then
        SECRET_KEY=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9')
        REDIS_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9')
        MINIO_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9')
        GRAFANA_PASS=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9')
    else
        DB_PASS="db_$(date +%s)_$RANDOM"
        REDIS_PASS="redis_$(date +%s)_$RANDOM"
        MINIO_PASS="minio_$(date +%s)_$RANDOM"
        SECRET_KEY="sk_$(date +%s)_$RANDOM$(openssl rand -hex 16 2>/dev/null || echo "")"
        ENCRYPTION_KEY="ek_$(date +%s)_$RANDOM"
        GRAFANA_PASS="grafana_$RANDOM"
    fi

    # Appliquer au .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/SECRET_KEY=$/SECRET_KEY=$SECRET_KEY/" .env
        sed -i '' "s/ENCRYPTION_KEY=$/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
        sed -i '' "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
        sed -i '' "s/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_PASS/" .env
        sed -i '' "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASS/" .env
    else
        sed -i "s/SECRET_KEY=$/SECRET_KEY=$SECRET_KEY/" .env
        sed -i "s/ENCRYPTION_KEY=$/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
        sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
        sed -i "s/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_PASS/" .env
        sed -i "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASS/" .env
    fi

    pass_msg "Fichier .env généré avec des clés sécurisées"
else
    warn_msg "Le fichier .env existe déjà. Utilisation des valeurs existantes."
fi

# ── L'infrastructure de base (DB, Redis, MinIO) ────────
info_msg "Démarrage de l'infrastructure (DB, Redis, MinIO)..."
$DOCKER_COMPOSE_CMD up -d db redis minio

# Attendre PostgreSQL
info_msg "⏳ Attente de PostgreSQL..."
for i in $(seq 1 30); do
    if $DOCKER_COMPOSE_CMD exec -T db pg_isready -U donbosco_user -d donbosco 2>/dev/null; then
        pass_msg "PostgreSQL prêt"
        break
    fi
    if [ "$i" -eq 30 ]; then
        error_msg "PostgreSQL ne répond pas après 30 tentatives."
        exit 1
    fi
    sleep 2
done

# ── Lancer l'API pour exécuter les migrations ──────────
info_msg "Démarrage de l'API (migrations Alembic + seed)..."
$DOCKER_COMPOSE_CMD up -d api

info_msg "⏳ Attente de l'API..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
        pass_msg "API prête"
        break
    fi
    if [ "$i" -eq 30 ]; then
        error_msg "L'API ne répond pas après 30 secondes."
        info_msg "Logs de l'API :"
        $DOCKER_COMPOSE_CMD logs --tail=20 api
        exit 1
    fi
    sleep 1
done

# ── Seed ────────────────────────────────────────────────
info_msg "Initialisation de la base de données..."
$DOCKER_COMPOSE_CMD exec -T api python scripts/init_db.py
pass_msg "Base de données initialisée"

# ── Ollama modèles IA ──────────────────────────────────
info_msg "Démarrage d'Ollama (téléchargement des modèles IA)..."
$DOCKER_COMPOSE_CMD up -d ollama

info_msg "⏳ Téléchargement de qwen2.5:7b-instruct (plusieurs minutes)..."
$DOCKER_COMPOSE_CMD exec -T ollama ollama pull qwen2.5:7b-instruct 2>&1 | tail -1
pass_msg "Modèle de chat téléchargé"

info_msg "⏳ Téléchargement de nomic-embed-text..."
$DOCKER_COMPOSE_CMD exec -T ollama ollama pull nomic-embed-text 2>&1 | tail -1
pass_msg "Modèle d'embedding téléchargé"

# ── Lancer le reste de la stack ────────────────────────
info_msg "Démarrage de tous les services..."
$DOCKER_COMPOSE_CMD up -d worker beat flower frontend nginx prometheus grafana

# ── Vérification finale ────────────────────────────────
info_msg "Vérification de l'état de la stack..."
sleep 5
$DOCKER_COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || true

# Vérifier les healthchecks
echo ""
info_msg "Health check de l'API..."
curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo -e "║  ${PASS_COLOR}✅ Don Bosco Connect est opérationnel !${NC}   ║"
echo "║                                                  ║"
echo "║  🌐 Frontend :  http://localhost:80              ║"
echo "║  📡 API :       http://localhost:8000            ║"
echo "║  📁 MinIO :     http://localhost:9001            ║"
echo "║  🌸 Flower :    http://localhost:5555            ║"
echo "║  📊 Grafana :   http://localhost:3001            ║"
echo "║                                                  ║"
echo "║  🧑‍💼 Admin :  admin@donbosco.tn / admin123!    ║"
echo "║  👨‍🏫 Teacher : karim.hamdi@donbosco.tn          ║"
echo "║  👨‍🎓 Student : adam.slim@donbosco.tn            ║"
echo "║  👨‍👩‍👧 Parent : ahmed.slim@parent.tn             ║"
echo "║                                                  ║"
echo "║  📖 Guide : https://github.com/HiTechTN/        ║"
echo "║            don-bosco-connect                     ║"
echo "╚══════════════════════════════════════════════════╝"

# ── Vérifier les services problématiques ───────────────
echo ""
info_msg "Résumé des services :"
$DOCKER_COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null

echo ""
echo -e "${INFO_COLOR}ℹ️  Utilisez '${DOCKER_COMPOSE_CMD} logs -f api' pour suivre les logs.${NC}"
echo -e "${INFO_COLOR}ℹ️  Utilisez '${DOCKER_COMPOSE_CMD} down' pour arrêter tous les services.${NC}"
