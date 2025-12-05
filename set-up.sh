#!/bin/zsh

echo "🚀 Setting up your NestJS environment..."

# -------- ENSURE GLOBAL PREFIX IS ~/.npm-global --------
echo "⚙️ Ensuring global npm prefix is ~/.npm-global..."
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global

# Add npm-global to PATH for this script
export PATH=$PATH:$HOME/.npm-global/bin

# Ensure PATH persists in future shells
if ! grep -q ".npm-global/bin" ~/.zshrc; then
    echo 'export PATH=$PATH:$HOME/.npm-global/bin' >> ~/.zshrc
fi

echo "✔ npm-global prefix and PATH set."

# -------- INSTALL NEST CLI GLOBALLY --------
echo "📦 Installing NestJS CLI globally..."
npm install -g @nestjs/cli || { echo "❌ Failed to install Nest CLI"; exit 1; }

# -------- BACKEND SETUP --------
echo "📂 Entering backend folder..."
cd backend || { echo "❌ backend folder not found!"; exit 1; }

echo "📥 Installing backend dependencies..."
npm install || { echo "❌ Backend dependencies failed to install"; exit 1; }

# -------- INSTALL BCRYPT + TYPES --------
echo "🔐 Installing bcrypt and type definitions..."
npm install bcrypt || { echo "❌ Failed to install bcrypt"; exit 1; }
npm install --save-dev @types/bcrypt || { echo "❌ Failed to install @types/bcrypt"; exit 1; }

echo "✔ bcrypt + @types/bcrypt installed."

echo "✨ Backend is ready!"

echo ""
echo "▶️ You can now start the NestJS dev server with:"
echo "   👉 npm run start:dev"
echo ""
echo "🎉 Setup complete — you're ready to code!"
