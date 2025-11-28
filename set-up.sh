#!/bin/bash

echo "🚀 Setting up your NestJS environment..."

# -------- FIX GLOBAL NPM PERMISSIONS ON MACOS --------
OS_TYPE="$(uname -s)"

if [[ "$OS_TYPE" == "Darwin" ]]; then
    echo "🍎 macOS detected — checking npm global permissions..."

    NPM_PREFIX=$(npm config get prefix)

    if [[ "$NPM_PREFIX" == "/usr/local" ]]; then
        echo "🔧 Fixing npm global install location (no sudo required)..."
        mkdir -p ~/.npm-global
        npm config set prefix ~/.npm-global

        # Add to PATH only if not already there
        if ! grep -q ".npm-global/bin" ~/.zshrc; then
            echo 'export PATH=$PATH:~/.npm-global/bin' >> ~/.zshrc
        fi

        # load the updated PATH
        source ~/.zshrc

        echo "✔ npm global prefix fixed: $(npm config get prefix)"
    else
        echo "✔ npm global prefix already safe."
    fi
else
    echo "🪟 Windows or Linux detected — no permission fix needed."
fi

# -------- INSTALL NEST CLI GLOBALLY --------
echo "📦 Installing NestJS CLI globally..."
npm install -g @nestjs/cli || { echo "❌ Failed to install Nest CLI"; exit 1; }

# -------- BACKEND SETUP --------
echo "📂 Entering backend folder..."
cd backend || { echo "❌ backend folder not found!"; exit 1; }

echo "📥 Installing project dependencies..."
npm install

echo "✨ All dependencies installed!"

echo ""
echo "▶️ To start the NestJS dev server:"
echo "   👉 cd backend"
echo "   👉 npm run start:dev"
echo ""
echo "🎉 Setup complete — you're ready to code!"
