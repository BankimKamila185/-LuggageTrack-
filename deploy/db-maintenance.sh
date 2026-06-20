#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  LuggageTrack — Database Maintenance & Log Archival Script
#  Cleans up old telemetry notifications and optimizes indexes
# ══════════════════════════════════════════════════════════════
set -euo pipefail

# Configuration
DB_TYPE="${DB_TYPE:-postgres}"
DB_CONTAINER="${DB_CONTAINER:-luggagetrack_db}"
DB_USER="${DB_USER:-luggagetrack}"
DB_NAME="${DB_NAME:-luggagetrack}"

echo "[$(date)] Starting database maintenance routine (${DB_TYPE})..."

# Check if the container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "[ERROR] Database container ${DB_CONTAINER} is not running! Maintenance failed." >&2
  exit 1
fi

if [ "$DB_TYPE" = "postgres" ]; then
  # 1. Clean up notifications older than 14 days
  echo "[$(date)] Cleaning up notifications older than 14 days..."
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    "DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '14 days';"

  # 2. Archive or clean up old activity logs (keep last 30 days)
  echo "[$(date)] Cleaning up activity logs older than 30 days..."
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    "DELETE FROM activity_log WHERE created_at < NOW() - INTERVAL '30 days';"

  # 3. Re-index database tables for query optimization
  echo "[$(date)] Re-indexing database tables..."
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    "REINDEX DATABASE $DB_NAME;"

  # 4. Run VACUUM to reclaim storage space
  echo "[$(date)] Vacuuming database tables to reclaim storage..."
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
    "VACUUM ANALYZE;"

elif [ "$DB_TYPE" = "mysql" ] || [ "$DB_TYPE" = "mariadb" ]; then
  # 1. Clean up notifications older than 14 days
  echo "[$(date)] Cleaning up notifications older than 14 days..."
  docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -D "$DB_NAME" -e \
    "DELETE FROM notifications WHERE created_at < NOW() - INTERVAL 14 DAY;"

  # 2. Archive or clean up old activity logs (keep last 30 days)
  echo "[$(date)] Cleaning up activity logs older than 30 days..."
  docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -D "$DB_NAME" -e \
    "DELETE FROM activity_log WHERE created_at < NOW() - INTERVAL 30 DAY;"

  # 3. Optimize tables for InnoDB to reclaim space and rebuild indexes
  echo "[$(date)] Optimizing database tables..."
  docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -D "$DB_NAME" -e \
    "OPTIMIZE TABLE users, baggage, lost_reports, notifications, activity_log;"
else
  echo "[ERROR] Unsupported database type: ${DB_TYPE}" >&2
  exit 1
fi

echo "[$(date)] Database maintenance completed successfully."
