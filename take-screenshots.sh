#!/bin/bash
# Prendre des captures d'écran réelles avec Firefox

SCREENSHOT_DIR="/home/hitech/projects/Don_Bosco_Connect/screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "Attente que les serveurs soient prêts..."
sleep 5

echo "Capture 1: Landing Page (localhost:3000)"
firefox --headless --screenshot "$SCREENSHOT_DIR/01-landing.png" --window-size=1280,800 "http://localhost:3000" 2>/dev/null
sleep 2

echo "Capture 2: Login Page (localhost:3000/login)"
firefox --headless --screenshot "$SCREENSHOT_DIR/02-login.png" --window-size=1280,800 "http://localhost:3000/login" 2>/dev/null
sleep 2

echo "Capture 3: Admin Login (localhost:8000/admin)"
firefox --headless --screenshot "$SCREENSHOT_DIR/03-admin-login.png" --window-size=1280,800 "http://localhost:8000/admin/login/" 2>/dev/null
sleep 2

echo "Capture 4: Admin Dashboard (après login manuel nécessaire)"
# Note: Pour les pages nécessitant une auth, il faudrait utiliser Selenium ou Playwright
firefox --headless --screenshot "$SCREENSHOT_DIR/04-admin.png" --window-size=1280,800 "http://localhost:8000/admin/" 2>/dev/null
sleep 2

echo "Capture 5: Web Dashboard (localhost:3000)"
firefox --headless --screenshot "$SCREENSHOT_DIR/05-dashboard.png" --window-size=1280,800 "http://localhost:3000" 2>/dev/null
sleep 2

echo ""
echo "Captures sauvegardées dans: $SCREENSHOT_DIR"
ls -lh "$SCREENSHOT_DIR"/*.png 2>/dev/null || echo "Aucune capture générée"
