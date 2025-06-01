#!/bin/bash
set -e

echo ""
echo "🧹 Removing existing Python virtual environment..."
rm -rf .venv
echo "✅ Done."

echo ""
echo "📦 Installing pre-commit hook dependencies..."
npm install
echo "✅ Done."

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ../
echo "✅ Done."

echo ""
echo "🐍 Setting up and activating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
echo "✅ Done."

echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip
echo "✅ Done."

echo ""
echo "🐍 Installing core packages without dependencies..."
xargs -n 1 pip install --no-deps < requirements.lightweight.txt
echo "✅ Done."

echo ""
echo "🎉 Lightweight dev environment setup complete."
echo ""