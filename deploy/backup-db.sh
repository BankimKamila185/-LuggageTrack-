#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  LuggageTrack — Database Auto-Backup & Disaster Recovery Sync
#  Supports both PostgreSQL and MySQL/MariaDB container stacks
# ══════════════════════════════════════════════════════════════
set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_TYPE="${DB_TYPE:-postgres}" # postgres or mysql
DB_CONTAINER="${DB_CONTAINER:-luggagetrack_db}"
DB_USER="${DB_USER:-luggagetrack}"
DB_NAME="${DB_NAME:-luggagetrack}"
S3_BUCKET="${S3_BUCKET:-s3://luggagetrack-db-backups-prod}"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting database backup routine (${DB_TYPE})..."

# Check if the container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "[ERROR] Database container ${DB_CONTAINER} is not running! Backup failed." >&2
  exit 1
fi

BACKUP_FILE="${BACKUP_DIR}/luggagetrack_${DB_TYPE}_backup_${TIMESTAMP}.sql.gz"

if [ "$DB_TYPE" = "postgres" ]; then
  # PostgreSQL backup using pg_dump
  docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
elif [ "$DB_TYPE" = "mysql" ] || [ "$DB_TYPE" = "mariadb" ]; then
  # MySQL / MariaDB backup using mysqldump
  # Note: MYSQL_PWD is set inside container env or we can pass password via credentials if configured
  docker exec "$DB_CONTAINER" mysqldump -u "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  echo "[ERROR] Unsupported database type: ${DB_TYPE}" >&2
  exit 1
fi

echo "[$(date)] Backup file generated: ${BACKUP_FILE}"
echo "[$(date)] Syncing backup to AWS S3 bucket: ${S3_BUCKET}..."

# Attempt upload to S3 (ignores errors if aws CLI is not configured or in sandbox env)
if command -v aws &>/dev/null; then
  aws s3 cp "$BACKUP_FILE" "${S3_BUCKET}/" --quiet && echo "[$(date)] Successfully uploaded to S3." || echo "[WARN] S3 upload failed."
else
  echo "[WARN] AWS CLI not found. Local backup created at ${BACKUP_FILE} (not uploaded to S3)."
fi

# Clean up local backups older than RETENTION_DAYS
echo "[$(date)] Purging local backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[$(date)] Database backup completed successfully."
