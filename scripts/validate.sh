#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Don Bosco Connect — Validation production"
echo ""

ERRORS=0

# 1. Secrets
echo "1/6 Vérification secrets..."
if git ls-files | xargs grep -l "SECRET_KEY.*=.*[a-f0-9]\{32\}" 2>/dev/null | grep -v ".example"; then
  echo "❌ Secrets détectés dans le repo"
  ERRORS=$((ERRORS+1))
else
  echo "✅ Aucun secret dans le repo"
fi

# 2. Tests backend
echo "2/6 Tests backend..."
cd backend
if pytest --cov=app --cov-fail-under=70 -q 2>&1 | tail -1 | grep -q "passed"; then
  echo "✅ Tests backend OK"
else
  echo "❌ Tests backend échoués ou coverage insuffisant"
  ERRORS=$((ERRORS+1))
fi
cd ..

# 3. TypeScript
echo "3/6 TypeScript strict..."
cd frontend
if npx tsc --noEmit 2>&1 | grep -q "error"; then
  echo "❌ Erreurs TypeScript détectées"
  ERRORS=$((ERRORS+1))
else
  echo "✅ TypeScript OK"
fi
cd ..

# 4. Build frontend
echo "4/6 Build production frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
  echo "✅ Build frontend OK"
else
  echo "❌ Build frontend échoué"
  ERRORS=$((ERRORS+1))
fi
cd ..

# 5. Docker Compose
echo "5/6 Configuration Docker Compose..."
if [ -f .env ]; then
  if docker compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose valide"
  else
    echo "❌ Docker Compose invalide"
    ERRORS=$((ERRORS+1))
  fi
else
  echo "⚠️  .env manquant — création depuis .env.example"
  cp .env.example .env
  echo "✅ .env créé (valeurs par défaut)"
fi

# 6. Stack complète
echo "6/6 Démarrage de la stack..."
docker compose up -d --wait 2>/dev/null || docker compose up -d
sleep 5
if curl -sf http://localhost:8002/health > /dev/null 2>&1; then
  echo "✅ API accessible"
else
  echo "❌ API inaccessible"
  ERRORS=$((ERRORS+1))
fi
docker compose down 2>/dev/null || true

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 VALIDATION RÉUSSIE — Projet prêt pour la production"
  exit 0
else
  echo "💥 $ERRORS problème(s) détecté(s) — Corriger avant livraison"
  exit 1
fi
