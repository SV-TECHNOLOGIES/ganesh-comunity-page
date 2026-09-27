#!/bin/bash

# Configuration
PROD_DB="postgresql://uhjhbe82j8mge:MITRA%40UK8080@35.214.110.189:5432/db7jggcbkrdfgf?sslmode=disable"
LOCAL_DB="postgresql://venkey:venkey.dev@localhost:5432/project_management"

echo "⚠️  Wiping local database and restoring from Production..."
set -e
# Dump from prod and restore directly to local in parallel streams
pg_dump "$PROD_DB" -n ukta --no-owner --no-acl -F c | pg_restore -d "$LOCAL_DB" --clean --if-exists --no-owner --no-acl -n ukta 

echo "✅ Local database updated successfully!"