#!/bin/bash

# Stop on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to print status messages
status() {
    echo -e "${YELLOW}[*]${NC} $1"
}

# Function to print success messages
success() {
    echo -e "${GREEN}[+]${NC} $1"
}

# Function to print error messages and exit
error() {
    echo -e "${RED}[!] ERROR:${NC} $1"
    exit 1
}

# Check if commands exist
for cmd in docker curl; do
    if ! command -v $cmd &> /dev/null; then
        error "$cmd is required but not installed"
    fi
done

section "Starting Ollama JSX Application"

# Check if Docker is running
status "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi
success "Docker is running"

# Check if Ollama is running
status "Checking if Ollama is running..."
if ! pgrep -x "Ollama" > /dev/null; then
    status "Ollama is not running. Starting Ollama..."
    open -a Ollama
    status "Waiting 10 seconds for Ollama to start..."
    sleep 10
    
    # Verify Ollama started
    if ! pgrep -x "Ollama" > /dev/null; then
        error "Failed to start Ollama. Please start it manually and try again."
    fi
fi
success "Ollama is running"

# Check if Mistral model is available
status "Checking if Mistral model is available..."
if ! curl -s http://localhost:11434/api/tags | grep -q "mistral"; then
    status "Mistral model not found. Pulling it now..."
    if ! ollama pull mistral; then
        error "Failed to pull Mistral model. Please check your internet connection and try again."
    fi
fi
success "Mistral model is available"

# Start the application
section "Starting Application"
status "Stopping any running containers..."
docker-compose down -v --remove-orphans || true

status "Building and starting containers..."
if ! docker-compose up --build -d; then
    error "Failed to start containers. Check the logs with: docker-compose logs"
fi

# Show status
section "Application Status"
success "Application is starting up!"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend API:${NC} http://localhost:8006"
echo -e "\n${YELLOW}Commands:${NC}"
echo -e "  View logs:    ${GREEN}docker-compose logs -f${NC}"
echo -e "  Stop app:     ${GREEN}docker-compose down${NC}"

# Show initial logs
section "Logs (Ctrl+C to exit)"
docker-compose logs -f --tail=20
