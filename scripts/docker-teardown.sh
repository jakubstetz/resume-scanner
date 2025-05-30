#!/bin/bash

echo ""
echo "🛑 Stopping Docker container..."
docker stop resume-scanner || true
echo "✅ Done."

echo ""
echo "🧼 Removing Docker container and images..."
docker rm resume-scanner || true
docker rmi resume-scanner || true
echo "✅ Done."

echo ""
echo "🎉 Docker deployment torn down."
echo ""