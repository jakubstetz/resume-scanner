#!/bin/bash
set -e

echo ""
echo "🛑 Stopping old Docker container..."
docker stop resume-scanner || true
echo "✅ Done."

echo ""
echo "🧼 Removing old Docker container and images..."
docker rm resume-scanner || true
docker rmi resume-scanner || true
echo "✅ Done."

echo ""
echo "🐳 Building new Docker image..."
docker build --pull -t resume-scanner .
echo "✅ Done."

echo ""
echo "🚀 Spinning up new Docker container..."
docker run -d --restart unless-stopped --name resume-scanner -p 8002:8002 --env-file .env resume-scanner
echo "✅ Done."

echo ""
echo "🎉 Backend running on Docker."
echo ""