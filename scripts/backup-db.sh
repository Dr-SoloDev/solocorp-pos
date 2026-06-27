#!/bin/bash
# Database backup script for Lekk POS
set -euo pipefail

BACKUP_DIR="/home/drsolodev/solocorp-pos/docker/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

docker exec lekk-db pg_dump -U solocorp solocorp_pos > "$BACKUP_DIR/lekk_pos_$TIMESTAMP.sql"
echo "✅ Backup saved: $BACKUP_DIR/lekk_pos_$TIMESTAMP.sql"
