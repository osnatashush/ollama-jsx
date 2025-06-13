#!/bin/bash

# Stop on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting Setup ===${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Ollama is running
if ! pgrep -x "Ollama" > /dev/null; then
    echo -e "${YELLOW}Ollama is not running. Starting Ollama...${NC}"
    open -a Ollama
    echo "Waiting 10 seconds for Ollama to start..."
    sleep 10
fi

# Check if Mistral model is available
echo -e "${YELLOW}Checking if Mistral model is available...${NC}"
if ! curl -s http://localhost:11434/api/tags | grep -q "mistral"; then
    echo -e "${YELLOW}Mistral model not found. Pulling it now...${NC}"
    ollama pull mistral
fi

# Start the application
echo -e "${GREEN}Starting application with Docker Compose...${NC}"
docker-compose down -v --remove-orphans
docker-compose up --build -d

echo -e "\n${GREEN}Application is starting up!${NC}"
echo -e "Frontend will be available at: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API is available at: ${GREEN}http://localhost:8006${NC}"
echo -e "\nTo view logs, run: ${YELLOW}docker-compose logs -f${NC}"
echo -e "To stop the application, run: ${YELLOW}docker-compose down${NC}"

# Show initial logs
echo -e "\n${YELLOW}=== Initial logs (Ctrl+C to exit logs and continue) ===${NC}"
docker-compose logs -f --tail=20
