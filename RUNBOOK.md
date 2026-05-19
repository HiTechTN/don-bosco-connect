# Don Bosco Connect — Runbook

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-c96442?style=flat-square" alt="Version"/>
</p>

## Démarrage
```bash
cd /home/hitech/projects/don-bosco-connect
docker compose up -d
```

## Arrêt
```bash
docker compose down
```

## Sauvegarde
```bash
./scripts/backup.sh    # → /backups/ (rétention 30 jours)
```

## Restauration
```bash
docker compose exec -T db psql -U donbosco_user -d donbosco < backup.sql
```

## Monitoring
- Grafana : `http://localhost:3001` (admin / password dans .env)
- Prometheus : `http://localhost:9090`
- Logs : `docker compose logs -f`

## Tests de charge
```bash
cd backend && locust -f locustfile.py --host http://localhost:80
# Ouvrir http://localhost:8089
```

## Mise à jour
```bash
docker compose build api
docker compose up -d api
```

## ⚙️ Variables d'environnement
Toutes dans `.env`. Ne jamais versionner ce fichier.
