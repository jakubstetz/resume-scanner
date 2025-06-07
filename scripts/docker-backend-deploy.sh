#!/bin/bash
set -e

echo ""
echo "🛑 Stopping old Docker container..."
docker stop resume-scanner || true
echo "✅ Done."

echo ""
echo "🧹 Cleaning up Docker environment..."
# Note that this will remove all unused images, volumes, and containers.
# Great for a lean EC2 environment, but dangerous for local development!
# For a lighter, safer cleanup, use:
#     docker rm resume-scanner || true
#     docker rmi resume-scanner || true
docker system prune -a --volumes -f
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