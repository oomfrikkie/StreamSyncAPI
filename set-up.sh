#!/bin/bash

echo "🚀 Setting up your NestJS environment..."

echo "📦 Installing NestJS CLI globally..."
npm install -g @nestjs/cli

echo "📂 Entering backend folder..."
cd backend || { echo "❌ backend folder not found!"; exit 1; }

echo "📥 Installing dependencies from package.json..."
npm install

echo "✨ All dependencies installed successfully!"

echo ""
echo "▶️ To start the NestJS dev server:"
echo "   👉 cd backend"
echo "   👉 npm run start:dev"
echo ""
echo "🎉 You're ready to code!"
