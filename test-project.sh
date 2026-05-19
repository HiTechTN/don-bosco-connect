#!/bin/bash
# Test complet de Don Bosco Connect

echo "=== Test Don Bosco Connect v1.0.9 ==="
echo ""

# Test Backend API
echo "1. Test Backend API (port 8000)..."
curl -s http://localhost:8000/api/accounts/ | grep -q "Informations d'authentification" && echo "   ✅ Backend API accessible" || echo "   ❌ Backend API inaccessible"

# Test Web Frontend
echo "2. Test Web Frontend (port 3000)..."
curl -s http://localhost:3000 | grep -q "<!DOCTYPE html>" && echo "   ✅ Web Frontend accessible" || echo "   ❌ Web Frontend inaccessible"

# Test Database
echo "3. Test Database..."
psql -U donbosco -d don_bosco -c "SELECT 1;" >/dev/null 2>&1 && echo "   ✅ PostgreSQL connecté" || echo "   ❌ PostgreSQL non connecté"

# Test Builds
echo "4. Test Builds..."
[ -d "/home/hitech/projects/Don_Bosco_Connect/web/dist" ] && echo "   ✅ Web build existant" || echo "   ⚠️  Web build manquant"
[ -d "/home/hitech/projects/Don_Bosco_Connect/mobile/dist" ] && echo "   ✅ Mobile build existant" || echo "   ⚠️  Mobile build manquant"

# Test Release
echo "5. Test Release v1.0.9..."
gh release view v1.0.9 >/dev/null 2>&1 && echo "   ✅ Release v1.0.9 créé" || echo "   ❌ Release v1.0.9 manquant"

echo ""
echo "=== Résumé ==="
echo "Backend  : http://localhost:8000/admin"
echo "Web      : http://localhost:3000"
echo "Release  : https://github.com/HiTechTN/don-bosco-connect/releases/tag/v1.0.9"
echo ""
echo "✅ Tests terminés!"