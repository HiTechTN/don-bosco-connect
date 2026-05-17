#!/usr/bin/env bash
set -euo pipefail

echo "╔══════════════════════════════════════════════════╗"
echo "║     Don Bosco Connect — Démarrage               ║"
echo "╚══════════════════════════════════════════════════╝"

# Vérifier que Docker est installé et en fonctionnement
if ! docker info &>/dev/null; then
    echo "❌ Docker n'est pas en fonctionnement. Lancez Docker d'abord."
    exit 1
fi

# Générer les clés secrètes si elles sont vides
ENV_FILE="$(dirname "$0")/../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env introuvable. Copiez .env.example vers .env et configurez-le."
    exit 1
fi

if grep -q "SECRET_KEY=$" "$ENV_FILE" 2>/dev/null; then
    NEW_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/SECRET_KEY=$/SECRET_KEY=$NEW_KEY/" "$ENV_FILE"
    else
        sed -i "s/SECRET_KEY=$/SECRET_KEY=$NEW_KEY/" "$ENV_FILE"
    fi
    echo "🔑 SECRET_KEY générée"
fi

if grep -q "ENCRYPTION_KEY=$" "$ENV_FILE" 2>/dev/null; then
    NEW_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/ENCRYPTION_KEY=$/ENCRYPTION_KEY=$NEW_KEY/" "$ENV_FILE"
    else
        sed -i "s/ENCRYPTION_KEY=$/ENCRYPTION_KEY=$NEW_KEY/" "$ENV_FILE"
    fi
    echo "🔑 ENCRYPTION_KEY générée"
fi

cd "$(dirname "$0")/.."

echo ""
echo "🚀 Lancement des services..."
echo ""

# Démarrer l'infrastructure de base (DB, Redis, MinIO)
echo "📦 Infrastructure (DB, Redis, MinIO)..."
docker compose up -d db redis minio
echo "   ✅ OK"

# Attendre que la DB soit prête
echo "⏳ Attente de PostgreSQL..."
until docker compose exec db pg_isready -U donbosco_user -d donbosco 2>/dev/null; do
    sleep 2
done
echo "   ✅ PostgreSQL prêt"

# Démarrer Ollama (télécharge les modèles)
echo "🧠 Ollama (téléchargement des modèles IA)..."
docker compose up -d ollama
echo "   ⏳ Téléchargement en cours (qwen2.5:7b + nomic-embed-text)..."
docker compose wait ollama 2>/dev/null || true
echo "   ✅ Ollama prêt"

# Démarrer l'API et les workers
echo "⚙️  API + Workers..."
docker compose up -d api worker beat
echo "   ✅ OK"

# Démarrer le frontend
echo "🎨 Frontend..."
docker compose up -d frontend nginx
echo "   ✅ OK"

# Démarrer le monitoring
echo "📊 Monitoring (Prometheus + Grafana)..."
docker compose up -d prometheus grafana
echo "   ✅ OK"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Don Bosco Connect est opérationnel !         ║"
echo "║                                                  ║"
echo "║  🌐 Frontend :  http://localhost:80              ║"
echo "║  📡 API :       http://localhost:8000            ║"
echo "║  📁 MinIO :     http://localhost:9001            ║"
echo "║  🌸 Flower :    http://localhost:5555            ║"
echo "║  📊 Grafana :   http://localhost:3001            ║"
echo "║                                                  ║"
echo "║  🧑‍💼 Admin : admin@donbosco.tn / admin123!      ║"
echo "║  👨‍🏫 Teacher : karim.hamdi@donbosco.tn           ║"
echo "║  👨‍🎓 Student : adam.slim@donbosco.tn             ║"
echo "║  👨‍👩‍👧 Parent : ahmed.slim@parent.tn              ║"
echo "║                                                  ║"
echo "║  Tous les mots de passe par défaut :             ║"
echo "║  (voir scripts/init_db.py)                       ║"
echo "╚══════════════════════════════════════════════════╝"
