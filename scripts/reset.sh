#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Réinitialisation complète
# ATTENTION : Supprime TOUTES les données (DB, Redis, MinIO, Ollama)
# Usage: ./scripts/reset.sh
# ──────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

WARN='\033[1;33m'; ERROR='\033[0;31m'; NC='\033[0m'

echo -e "${WARN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${WARN}║   RÉINITIALISATION TOTALE                       ║${NC}"
echo -e "${WARN}║   Toutes les données seront supprimées           ║${NC}"
echo -e "${WARN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

read -r -p "Tapez 'RESET' pour confirmer : " CONFIRM
if [ "$CONFIRM" != "RESET" ]; then
    echo "❌ Annulé."
    exit 1
fi

echo ""
echo "🛑 Arrêt des services..."
docker compose down --volumes --remove-orphans 2>/dev/null || true

echo "🧹 Nettoyage des volumes Docker..."
docker volume rm don-bosco-connect_postgres_data don-bosco-connect_redis_data 2>/dev/null || true

echo "🧹 Réinitialisation des certificats SSL..."
rm -f nginx/ssl/donbosco.crt nginx/ssl/donbosco.key

echo "✅ Réinitialisation terminée."
echo ""
echo "Pour tout reconstruire :"
echo "  ./scripts/setup.sh"
echo "  docker compose up -d"
echo "  docker compose exec api python scripts/init_db.py"
echo "  docker compose exec ollama ollama pull qwen2.5:7b-instruct"
echo "  docker compose exec ollama ollama pull nomic-embed-text"
