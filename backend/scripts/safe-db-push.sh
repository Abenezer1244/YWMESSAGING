#!/bin/bash
# SAFE DATABASE PUSH SCRIPT
# Always creates a backup before pushing schema changes

echo "⚠️  DATABASE SCHEMA CHANGE WARNING"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set. Aborting."
  exit 1
fi

# Create backup directory
mkdir -p ./backups

# Generate backup filename with timestamp
BACKUP_FILE="./backups/backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Creating backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully"
  echo ""
  echo "🔄 Running prisma db push (WITHOUT --accept-data-loss)..."
  npx prisma db push
  echo ""
  echo "✅ Schema push complete"
  echo "📦 Backup saved at: $BACKUP_FILE"
else
  echo "❌ Backup failed. Aborting schema push."
  exit 1
fi
