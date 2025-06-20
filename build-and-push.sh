#!/bin/bash

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo "Usage: $0 osnatashush"
    exit 1
fi

USERNAME=$1

# Build and push backend
echo "Building and pushing backend image..."
docker build -t ${USERNAME}/ollama-jsx-backend:latest -f Backend/Dockerfile Backend
docker push ${USERNAME}/ollama-jsx-backend:latest

echo "Backend image pushed successfully"

# Build and push frontend
echo "Building and pushing frontend image..."
docker build -t ${USERNAME}/ollama-jsx-frontend:latest -f Frontend/Dockerfile Frontend
docker push ${USERNAME}/ollama-jsx-frontend:latest

echo "Frontend image pushed successfully"

# Replace username in docker-compose.prod.yml
echo "Updating docker-compose.prod.yml with your username..."
sed -i '' "s/osnatashush/${USERNAME}/g" docker-compose.prod.yml

echo "All images built and pushed successfully!"
