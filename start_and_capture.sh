#!/bin/bash

# Arrêter les anciens processus
pkill -f "manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Démarrer le backend
cd /home/hitech/projects/Don_Bosco_Connect/backend
nohup python3 manage.py runserver 127.0.0.1:8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend démarré (PID: $BACKEND_PID)"
sleep 3

# Démarrer le frontend
cd /home/hitech/projects/Don_Bosco_Connect/web
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend démarré (PID: $FRONTEND_PID)"
sleep 5

# Créer le dossier screenshots
mkdir -p /home/hitech/projects/Don_Bosco_Connect/screenshots

# Vérifier que les serveurs répondent
echo "Vérification des serveurs..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://127.0.0.1:8000/admin/
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:5173/

# Prendre les screenshots avec wkhtmltoimage
echo "Capture des screenshots..."

# Page d'accueil
DISPLAY=:99 xvfb-run -a wkhtmltoimage --width 1280 --height 800 http://localhost:5173 /home/hitech/projects/Don_Bosco_Connect/screenshots/01-landing.png 2>&1

# Page de connexion
DISPLAY=:99 xvfb-run -a wkhtmltoimage --width 1280 --height 800 http://localhost:5173/login /home/hitech/projects/Don_Bosco_Connect/screenshots/02-login.png 2>&1

# Admin Django
DISPLAY=:99 xvfb-run -a wkhtmltoimage --width 1280 --height 800 http://127.0.0.1:8000/admin/ /home/hitech/projects/Don_Bosco_Connect/screenshots/03-admin.png 2>&1

echo "Screenshots sauvegardés dans screenshots/"
ls -la /home/hitech/projects/Don_Bosco_Connect/screenshots/
