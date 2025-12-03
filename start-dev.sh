#!/bin/bash

echo "🐳 Starting Docker containers..."
docker compose up -d

echo "🕒 Waiting for Postgres to be ready..."

# Change 'postgres_db' to your actual container name if different
CONTAINER_NAME="postgres_db"

# Wait until postgres says "accepting connections"
until docker exec "$CONTAINER_NAME" pg_isready >/dev/null 2>&1; do
    echo "Postgres not ready yet..."
    sleep 2
done

echo "🚀 Postgres is ready!"
echo "🚀 Starting NestJS dev server..."

cd backend
npm run start:dev
