#!/bin/bash
# Daily PostgreSQL backup script
# Usage: ./backup.sh

set -euo pipefail

BACKUP_DIR="/backups/postgres"
DB_NAME="${DB_NAME:-donbosco}"
DB_USER="${DB_USER:-donbosco_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

PGPASSFILE=$(mktemp)
echo "db:5432:${DB_NAME}:${DB_USER}:${DB_PASSWORD}" > "$PGPASSFILE"
chmod 600 "$PGPASSFILE"

PGPASSFILE="$PGPASSFILE" pg_dump -h db -U "$DB_USER" -d "$DB_NAME" \
    -F c -f "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

rm -f "$PGPASSFILE"

echo "Backup created: ${BACKUP_DIR}/${DB_NAME}_${DATE}.dump"

# Rotate old backups
find "$BACKUP_DIR" -name "${DB_NAME}_*.dump" -mtime +$RETENTION_DAYS -delete
echo "Old backups cleaned (retention: ${RETENTION_DAYS} days)"
