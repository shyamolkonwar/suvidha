#!/bin/bash

# Automated backup script for SUVIDHA databases
# Run this script daily via cron

BACKUP_DIR="/backups/suvidha"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database credentials (use environment variables in production)
DB_HOST=${DB_HOST:-localhost}
POSTGRES_USER=${POSTGRES_USER:-postgres}

# Databases to backup
DATABASES=(
  "auth_db"
  "utility_db"
  "payment_db"
  "grievance_db"
  "monitor_db"
  "cms_db"
  "analytics_db"
)

echo "Starting backup at $(date)"

# Backup each database
for db in "${DATABASES[@]}"; do
  echo "Backing up $db..."
  BACKUP_FILE="$BACKUP_DIR/${db}_${DATE}.sql.gz"
  
  PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h $DB_HOST \
    -U $POSTGRES_USER \
    -d $db \
    --format=custom \
    | gzip > $BACKUP_FILE
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully backed up $db to $BACKUP_FILE"
  else
    echo "✗ Failed to backup $db"
    exit 1
  fi
done

# Backup Redis data
echo "Backing up Redis..."
redis-cli --rdb $BACKUP_DIR/redis_${DATE}.rdb

# Remove old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
if [ ! -z "$S3_BUCKET" ]; then
  echo "Uploading to S3..."
  aws s3 sync $BACKUP_DIR s3://$S3_BUCKET/suvidha-backups/
fi

echo "Backup completed successfully at $(date)"
