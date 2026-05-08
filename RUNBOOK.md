# Don Bosco Connect – Runbook opérationnel

## Démarrage
cd /home/hitech/projects/don-bosco-connect
docker compose up -d

## Arrêt
docker compose down

## Sauvegarde base de données
./scripts/backup.sh
Les sauvegardes sont conservées 30 jours dans /backups.

## Restauration
docker compose exec -T db psql -U donbosco_user -d donbosco < fichier_sauvegarde.sql

## Monitoring
- Grafana : http://localhost:3001 (login admin / mot de passe dans .env)
- Prometheus : http://localhost:9090
- Logs : docker compose logs -f

## Tests de charge
cd backend
locust -f locustfile.py --host http://localhost:80
Puis ouvrir http://localhost:8089 dans un navigateur.

## Mise à jour de l'API
docker compose build api
docker compose up -d api

## Variables d'environnement
Toutes les variables sont dans le fichier .env. Ne jamais le versionner.
