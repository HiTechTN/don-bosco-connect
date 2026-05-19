#!/usr/bin/env bash
# Démarre la démo complète de Don Bosco Connect (backend + frontend)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="/tmp/vision-env/bin/python3"
BACKEND_PORT=8001
FRONTEND_PORT=5173

# Arrêter les processus existants
pkill -f "demo_backend.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

echo "╔══════════════════════════════════════╗"
echo "║  🚀 Don Bosco Connect - Mode Démo   ║"
echo "╚══════════════════════════════════════╝"

# 1. Backend
echo ""
echo "📦 Démarrage du backend (port $BACKEND_PORT)..."
rm -f /tmp/donbosco_demo.db
cd "$ROOT_DIR"
nohup "$VENV_PYTHON" demo_backend.py > /tmp/api_demo.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# Attendre que le backend soit prêt
for i in $(seq 1 10); do
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        echo "   ✅ Backend prêt"
        break
    fi
    sleep 1
done

# 2. Frontend
echo ""
echo "🎨 Démarrage du frontend (port $FRONTEND_PORT)..."
cd "$ROOT_DIR/frontend"
nohup npx vite --host 0.0.0.0 --port $FRONTEND_PORT > /tmp/vite_demo.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# Attendre que le frontend soit prêt
for i in $(seq 1 15); do
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        echo "   ✅ Frontend prêt"
        break
    fi
    sleep 1
done

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  ✅ Démo prête !                     ║"
echo "║                                      ║"
echo "║  🌐 Frontend : http://localhost:5173  ║"
echo "║  📡 Backend :  http://localhost:8001  ║"
echo "║                                      ║"
echo "║  👤 admin@donbosco.tn / admin123!    ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Log backend : /tmp/api_demo.log"
echo "Log frontend : /tmp/vite_demo.log"
echo "Appuyez sur Ctrl+C pour arrêter"

# Attendre et nettoyer au signal
trap "echo ''; echo '🛑 Arrêt...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
