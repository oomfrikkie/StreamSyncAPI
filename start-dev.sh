#!/bin/bash

echo "🐳 Starting Docker containers..."
docker compose up -d

echo "🕒 Waiting for Postgres to be ready..."

CONTAINER_NAME="postgres_db"

# Wait until Postgres is accepting connections
until docker exec "$CONTAINER_NAME" pg_isready >/dev/null 2>&1; do
    echo "Postgres not ready yet..."
    sleep 2
done

echo "🚀 Postgres is ready!"

# ----------------------------------------------------
# START BACKEND
# ----------------------------------------------------
echo "🔥 Starting NestJS backend..."

cd backend || { echo "❌ backend folder not found"; exit 1; }

# Run backend in background
npm run start:dev &
BACKEND_PID=$!

echo "✔ Backend running (PID: $BACKEND_PID)"

# ----------------------------------------------------
# START FRONTEND
# ----------------------------------------------------
echo "🎨 Starting React frontend..."

cd ../frontend || { echo "❌ frontend folder not found"; exit 1; }

npm run dev &
FRONTEND_PID=$!

echo "✔ Frontend running (PID: $FRONTEND_PID)"

# ----------------------------------------------------
# KEEP SCRIPT ALIVE
# ----------------------------------------------------
echo ""
echo "🚀 StreamSyncAPI is fully running:"
echo "   ➤ Backend:  http://localhost:3000"
echo "   ➤ Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl + C to stop both."

# Wait so the script doesn't exit
wait
