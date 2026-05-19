#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# Don Bosco Connect — Arrêt de la stack
# Usage: ./scripts/stop.sh
# ──────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "🛑 Arrêt de Don Bosco Connect..."

DOCKER_CMD="docker"
if ! docker info &>/dev/null 2>&1; then
    if podman info &>/dev/null 2>&1; then
        DOCKER_CMD="podman"
    else
        echo "❌ Docker/Podman indisponible"
        exit 1
    fi
fi

if docker compose version &>/dev/null 2>&1; then
    docker compose down --remove-orphans
elif podman-compose version &>/dev/null 2>&1; then
    podman-compose down --remove-orphans
elif docker-compose --version &>/dev/null 2>&1; then
    docker-compose down --remove-orphans
else
    echo "❌ docker compose introuvable"
    exit 1
fi

echo "✅ Stack arrêtée (volumes conservés)"
