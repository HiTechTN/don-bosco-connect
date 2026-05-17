#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Démarrage de la stack complète
# Usage: ./scripts/start.sh
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
echo -e "${INFO}║   Don Bosco Connect — Démarrage                 ║${NC}"
echo -e "${INFO}╚══════════════════════════════════════════════════╝${NC}"

# ── Vérification Docker ────────────────────────────────
DOCKER_CMD=""
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    DOCKER_CMD="docker"
elif command -v podman &>/dev/null && podman info &>/dev/null 2>&1; then
    DOCKER_CMD="podman"
    DOCKER_SOCK=$(podman info --format '{{.Host.RemoteSocket.Path}}' 2>/dev/null || echo "/run/podman/podman.sock")
    export DOCKER_HOST="unix://$DOCKER_SOCK"
    info_msg "Utilisation de Podman via $DOCKER_SOCK"
else
    error_msg "Docker/Podman introuvable. Installez Docker d'abord."
    exit 1
fi

# ── Vérifier .env ──────────────────────────────────────
if [ ! -f .env ]; then
    warn_msg "Fichier .env introuvable. Exécutez 'scripts/setup.sh' d'abord."
    exit 1
fi
pass_msg "Configuration trouvée"

# ── Générer les clés manquantes ────────────────────────
if grep -q "SECRET_KEY=$" .env 2>/dev/null; then
    warn_msg "SECRET_KEY vide — génération automatique..."
    NEW_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)
    sed -i "s/SECRET_KEY=$/SECRET_KEY=$NEW_KEY/" .env
    pass_msg "SECRET_KEY générée"
fi
if grep -q "ENCRYPTION_KEY=$" .env 2>/dev/null; then
    warn_msg "ENCRYPTION_KEY vide — génération automatique..."
    NEW_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))" 2>/dev/null || openssl rand -hex 16)
    sed -i "s/ENCRYPTION_KEY=$/ENCRYPTION_KEY=$NEW_KEY/" .env
    pass_msg "ENCRYPTION_KEY générée"
fi

# ── Détection compose ─────────────────────────────────
COMPOSE_CMD=""
if docker compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif podman-compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="podman-compose"
elif docker-compose --version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
else
    error_msg "docker compose introuvable"
    exit 1
fi

# ── Démarrage progressif ──────────────────────────────
echo ""
info_msg "Étape 1/5 — Infrastructure (PostgreSQL + pgvector, Redis, MinIO)..."
$COMPOSE_CMD up -d db redis minio
pass_msg "Infrastructure démarrée"

info_msg "⏳ Attente de PostgreSQL..."
for i in $(seq 1 30); do
    if $COMPOSE_CMD exec -T db pg_isready -U donbosco_user -d donbosco 2>/dev/null; then break; fi
    if [ "$i" -eq 30 ]; then error_msg "PostgreSQL injoignable"; exit 1; fi
    sleep 2
done
pass_msg "PostgreSQL prêt"

info_msg "Étape 2/5 — Ollama (modèles IA)..."
$COMPOSE_CMD up -d ollama
pass_msg "Ollama démarré"

info_msg "Étape 3/5 — API..."
$COMPOSE_CMD up -d api
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then pass_msg "API prête"; break; fi
    if [ "$i" -eq 30 ]; then error_msg "API injoignable"; $COMPOSE_CMD logs --tail=20 api; exit 1; fi
    sleep 1
done

info_msg "Étape 4/5 — Workers (Celery + Beat + Flower)..."
$COMPOSE_CMD up -d worker beat flower
pass_msg "Workers démarrés"

info_msg "Étape 5/5 — Frontend + Nginx + Monitoring..."
$COMPOSE_CMD up -d frontend nginx prometheus grafana
pass_msg "Frontend et monitoring démarrés"

# ── Vérification ──────────────────────────────────────
echo ""
info_msg "Vérification de la stack..."
sleep 3
$COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null

echo ""
curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Don Bosco Connect opérationnel               ║"
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
echo "╚══════════════════════════════════════════════════╝"
