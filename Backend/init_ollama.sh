#!/bin/bash

# Wait for Ollama to be ready
until curl -s http://ollama:11434/api/tags > /dev/null; do
  echo "Waiting for Ollama to be ready..."
  sleep 2
done

# Pull the Mistral model
echo "Pulling Mistral model..."
curl -X POST http://ollama:11434/api/pull -d '{"name": "mistral"}'

echo "Mistral model is ready!"

# Keep the container running
tail -f /dev/null
