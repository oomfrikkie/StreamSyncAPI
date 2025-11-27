@echo off
echo 🐳 Starting Docker containers...
docker compose up -d

echo 🚀 Starting NestJS dev server...
cd backend
npm run start:dev
