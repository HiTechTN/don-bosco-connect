#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Vérification de santé
# Usage: ./scripts/healthcheck.sh
# ──────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PASS='\033[0;32m'; INFO='\033[0;34m'; WARN='\033[1;33m'; ERROR='\033[0;31m'; NC='\033[0m'
pass_msg()  { echo -e "${PASS}  ✅ $1${NC}"; }
info_msg()  { echo -e "${INFO}  ℹ️  $1${NC}"; }
warn_msg()  { echo -e "${WARN}  ⚠️  $1${NC}"; }
error_msg() { echo -e "${ERROR}  ❌ $1${NC}"; }

echo ""
echo -e "${INFO}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${INFO}║   Don Bosco Connect — Health Check              ║${NC}"
echo -e "${INFO}╚══════════════════════════════════════════════════╝${NC}"
echo ""

DOCKER_CMD="docker"
if ! docker info &>/dev/null 2>&1; then
    if podman info &>/dev/null 2>&1; then
        DOCKER_CMD="podman"
    else
        error_msg "Docker/Podman indisponible"
        exit 1
    fi
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &>/dev/null 2>&1; then
    if podman-compose version &>/dev/null 2>&1; then
        COMPOSE_CMD="podman-compose"
    else
        error_msg "docker compose introuvable"
        exit 1
    fi
fi

TOTAL=0; PASSED=0; FAILED=0

check() {
    local name="$1"
    local status="$2"
    TOTAL=$((TOTAL+1))
    if [ "$status" -eq 0 ]; then
        pass_msg "$name"
        PASSED=$((PASSED+1))
    else
        error_msg "$name"
        FAILED=$((FAILED+1))
    fi
}

# 1. Containers running
info_msg "Vérification des conteneurs..."
$COMPOSE_CMD ps --format "{{.Name}} {{.Status}}" 2>/dev/null | while read -r name status; do
    if echo "$status" | grep -q "Up"; then
        pass_msg "$name"
    else
        error_msg "$name ($status)"
    fi
done

# 2. Health endpoints
echo ""
info_msg "Vérification des endpoints..."

# API health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
check "API (port 8000)" "$([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1)"

# Frontend
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "000")
check "Frontend (port 80)" "$([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1)"

# Vite dev
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")
check "Vite dev (port 5173)" "$([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1)"

# MinIO
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9001 2>/dev/null || echo "000")
check "MinIO Console (port 9001)" "$([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1)"

# Flower
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5555 2>/dev/null || echo "000")
check "Flower (port 5555)" "$([ "$HTTP_CODE" != "000" ] && echo 0 || echo 1)"

# Ollama
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:11434/api/tags 2>/dev/null || echo "000")
check "Ollama (port 11434)" "$([ "$HTTP_CODE" = "200" ] && echo 0 || echo 1)"

# 3. API health JSON detail
echo ""
info_msg "Détail de l'API :"
curl -s http://localhost:8000/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  API indisponible"

# 4. Résumé
echo ""
echo -e "${INFO}Résumé :${NC} $PASSED/$TOTAL services OK"
if [ "$FAILED" -gt 0 ]; then
    echo -e "${WARN}  $FAILED service(s) problématique(s). Consultez les logs :${NC}"
    echo "  docker compose logs --tail=30 <service>"
    exit 1
else
    echo -e "${PASS}  Tous les services sont opérationnels.${NC}"
fi
