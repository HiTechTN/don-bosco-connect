#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Configuration post-clonage
# Usage: ./scripts/setup.sh
# ──────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PASS='\033[0;32m'; INFO='\033[0;34m'; WARN='\033[1;33m'; ERROR='\033[0;31m'; NC='\033[0m'
pass_msg()  { echo -e "${PASS}✅ $1${NC}"; }
info_msg()  { echo -e "${INFO}ℹ️  $1${NC}"; }
warn_msg()  { echo -e "${WARN}⚠️  $1${NC}"; }
error_msg() { echo -e "${ERROR}❌ $1${NC}"; }

echo ""
echo -e "${INFO}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${INFO}║   Don Bosco Connect — Configuration du projet   ║${NC}"
echo -e "${INFO}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Vérifier Docker ─────────────────────────────────
if ! docker info &>/dev/null 2>&1; then
    if command -v podman &>/dev/null && podman info &>/dev/null 2>&1; then
        info_msg "Podman détecté à la place de Docker."
        export DOCKER_HOST=$(podman info --format '{{.Host.RemoteSocket.Path}}' 2>/dev/null || echo "/run/podman/podman.sock")
    else
        error_msg "Docker (ou Podman) n'est pas en fonctionnement."
        exit 1
    fi
fi
pass_msg "Docker/Podman disponible"

# ── 2. Fichier .env ────────────────────────────────────
if [ ! -f .env ]; then
    info_msg "Génération du fichier .env..."
    cp .env.example .env

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
    fi

    if [ -n "${SECRET_KEY:-}" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
            sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
            sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
            sed -i '' "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
            sed -i '' "s/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_PASS/" .env
            sed -i '' "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASS/" .env
        else
            sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
            sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
            sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
            sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
            sed -i "s/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_PASS/" .env
            sed -i "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASS/" .env
        fi
        pass_msg "Clés sécurisées générées dans .env"
        echo ""
        echo "╔══════════════════════════════════════════════════╗"
        echo "║  📋 Notez ces valeurs (affichage unique)        ║"
        echo "║                                                  ║"
        printf "║  DB_PASSWORD     = %-30s ║\n" "$DB_PASS"
        printf "║  REDIS_PASSWORD  = %-30s ║\n" "$REDIS_PASS"
        printf "║  MINIO_ROOT_PASSWORD = %-26s ║\n" "$MINIO_PASS"
        printf "║  GRAFANA_PASSWORD = %-28s ║\n" "$GRAFANA_PASS"
        printf "║  SECRET_KEY       = %-30s ║\n" "$SECRET_KEY"
        echo "╚══════════════════════════════════════════════════╝"
    else
        warn_msg "Ni python3 ni openssl trouvés. Configurez .env manuellement."
    fi
else
    warn_msg ".env déjà présent, conservation des valeurs existantes."
fi

# ── 3. Certificats SSL auto-signés ─────────────────────
if [ ! -f nginx/ssl/donbosco.crt ]; then
    info_msg "Génération des certificats SSL auto-signés..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout nginx/ssl/donbosco.key \
        -out nginx/ssl/donbosco.crt \
        -subj "/C=TN/ST=Tunis/L=Tunis/O=Don Bosco College/CN=donbosco.local" \
        2>/dev/null
    pass_msg "Certificats SSL générés"
fi

# ── 4. Générer démo vidéo (optionnel) ──────────────────
if [ -d "demo" ] && [ -f "demo/generate_audio.py" ]; then
    info_msg "Scripts de démonstration vidéo disponibles (demo/)."
    info_msg "Pour générer : cd demo && python generate_audio.py && python generate_video.py"
fi

# ── Résumé ──────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Configuration locale terminée                ║"
echo "║                                                  ║"
echo "║  Pour lancer la stack complète :                 ║"
echo "║    docker compose up -d                          ║"
echo "║                                                  ║"
echo "║  Pour initialiser la base et seed :              ║"
echo "║    docker compose exec api python scripts/       ║"
echo "║      init_db.py                                  ║"
echo "║                                                  ║"
echo "║  Pour télécharger les modèles IA :               ║"
echo "║    docker compose exec ollama ollama pull        ║"
echo "║      qwen2.5:7b-instruct                         ║"
echo "║    docker compose exec ollama ollama pull        ║"
echo "║      nomic-embed-text                            ║"
echo "╚══════════════════════════════════════════════════╝"
