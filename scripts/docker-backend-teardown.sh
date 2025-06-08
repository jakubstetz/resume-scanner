#!/bin/bash

echo ""
echo "🛑 Stopping Docker container..."
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
echo "🎉 Docker deployment torn down."
echo ""