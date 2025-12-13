#!/usr/bin/env bash
set -e

echo "🐳 Starting Docker containers..."
docker compose up -d

echo "🕒 Waiting for Postgres to be ready..."

CONTAINER_NAME="$(docker compose ps -q postgres)"

until docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1; do
  echo "Postgres not ready yet..."
  sleep 2
done

echo "🚀 Postgres is ready!"

# ----------------------------------------------------
# BACKEND
# ----------------------------------------------------
echo "🔥 Starting NestJS backend..."
cd backend || exit 1
npm run start:dev &
BACKEND_PID=$!

# ----------------------------------------------------
# FRONTEND
# ----------------------------------------------------
echo "🎨 Starting React frontend..."
cd ../frontend || exit 1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 StreamFlix running:"
echo "   ➤ Backend:  http://localhost:3000"
echo "   ➤ Swagger:  http://localhost:3000/api"
echo "   ➤ Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl + C to stop."

wait
