#!/bin/zsh

echo "🚀 Setting up your NestJS + React environment..."

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


# -------------------------------------------------------
# BACKEND SETUP
# -------------------------------------------------------
echo "📂 Entering backend folder..."
cd backend || { echo "❌ backend folder not found!"; exit 1; }

echo "📥 Installing backend dependencies..."
npm install || { echo "❌ Backend dependencies failed to install"; exit 1; }

echo "🔐 Installing bcrypt and its types..."
npm install bcrypt || { echo "❌ Failed to install bcrypt"; exit 1; }
npm install --save-dev @types/bcrypt || { echo "❌ Failed to install @types/bcrypt"; exit 1; }

echo "✔ Backend dependencies installed."

# Move back out
cd ..


# -------------------------------------------------------
# FRONTEND SETUP
# -------------------------------------------------------
echo "🌐 Setting up React frontend..."

if [ ! -d "frontend" ]; then
  echo "📦 Creating Vite React app..."
  npm create vite@latest frontend --template react --yes || { echo "❌ Failed to create React app"; exit 1; }
else
  echo "✔ Frontend folder already exists, skipping creation."
fi

cd frontend || { echo "❌ Failed to enter frontend folder"; exit 1; }

echo "📥 Installing frontend dependencies..."
npm install || { echo "❌ Frontend dependencies failed to install"; exit 1; }

echo "➕ Installing axios..."
npm install axios || { echo "❌ Failed to install axios"; exit 1; }

echo "🛣 Installing react-router-dom..."
npm install react-router-dom || { echo "❌ Failed to install react-router-dom"; exit 1; }

echo "✔ Frontend setup complete."


# -------------------------------------------------------
# DONE
# -------------------------------------------------------
echo ""
echo "✨ All setup complete!"
echo ""
echo "▶️ Start backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "▶️ Start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "🎉 You're ready to build your StreamSync frontend!"
