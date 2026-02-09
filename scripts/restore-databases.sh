#!/bin/bash

# Restore databases from backup

if [ -z "$1" ]; then
  echo "Usage: ./restore-databases.sh <backup_date>"
  echo "Example: ./restore-databases.sh 20260209_143000"
  exit 1
fi

BACKUP_DIR="/backups/suvidha"
BACKUP_DATE=$1

# Database credentials
DB_HOST=${DB_HOST:-localhost}
POSTGRES_USER=${POSTGRES_USER:-postgres}

DATABASES=(
  "auth_db"
  "utility_db"
  "payment_db"
  "grievance_db"
  "monitor_db"
  "cms_db"
  "analytics_db"
)

echo "Starting restore from backups dated $BACKUP_DATE"

# Confirm before proceeding
read -p "This will OVERWRITE existing databases. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

# Restore each database
for db in "${DATABASES[@]}"; do
  BACKUP_FILE="$BACKUP_DIR/${db}_${BACKUP_DATE}.sql.gz"
  
  if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Backup file not found: $BACKUP_FILE"
    continue
  fi
  
  echo "Restoring $db from $BACKUP_FILE..."
  
  # Drop and recreate database
  PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS $db;"
  PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U $POSTGRES_USER -c "CREATE DATABASE $db;"
  
  # Restore from backup
  gunzip < $BACKUP_FILE | PGPASSWORD=$POSTGRES_PASSWORD pg_restore \
    -h $DB_HOST \
    -U $POSTGRES_USER \
    -d $db \
    --no-owner \
    --no-privileges
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully restored $db"
  else
    echo "✗ Failed to restore $db"
  fi
done

echo "Restore completed at $(date)"
