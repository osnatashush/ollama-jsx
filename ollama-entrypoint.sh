#!/bin/sh
set -e

# Set environment variables
export OLLAMA_HOST=0.0.0.0
export OLLAMA_ORIGINS=*

# Ensure the .ollama directory exists and has correct permissions
echo "🔧 Setting up Ollama environment..."
mkdir -p /.ollama
chmod 777 /.ollama

# Start Ollama in the background
echo "🚀 Starting Ollama server..."
/bin/ollama serve &

# Wait for Ollama to start
MAX_RETRIES=60
COUNT=0
while ! curl -s http://localhost:11434/api/version >/dev/null; do
  if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Error: Failed to start Ollama after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "⏳ Waiting for Ollama to start... (Attempt $((COUNT+1))/$MAX_RETRIES)"
  sleep 2
  COUNT=$((COUNT+1))
done

echo "✅ Ollama server is running!"

# Pull the model if it doesn't exist
echo "🔍 Checking for Mistral model..."
if ! curl -s http://localhost:11434/api/tags | grep -q "mistral"; then
  echo "⬇️  Pulling Mistral model (this may take a few minutes)..."
  /bin/ollama pull mistral
  if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull Mistral model"
    exit 1
  fi
else
  echo "✅ Mistral model already exists"
fi

# Verify model is available
if curl -s http://localhost:11434/api/tags | grep -q "mistral"; then
  echo "✅ Mistral model is ready!"
  echo "🚀 Ollama is ready to use!"
else
  echo "❌ Error: Failed to verify Mistral model"
  exit 1
fi

# Keep the container running
echo "🔄 Ollama is running and ready to accept requests..."
wait
