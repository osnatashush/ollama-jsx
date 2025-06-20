#!/bin/sh

# Start Ollama
echo "Starting Ollama..."
curl -s http://localhost:11434/api/version || ollama serve &

# Wait for Ollama to start
sleep 5

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8006 &

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;"
