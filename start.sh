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
    [[ "$(uname -s)" == "Linux" ]]
}

# Function to check if GPU is available and properly configured
has_working_gpu() {
    # Check for NVIDIA GPU with proper drivers
    if is_linux; then
        if command_exists nvidia-smi; then
            if nvidia-smi > /dev/null 2>&1; then
                echo -e "${GREEN}Found NVIDIA GPU with working drivers.${NC}"
                return 0
            fi
        fi
        return 1
    
    # Check for Apple Silicon/Intel GPU on macOS
    elif is_macos; then
        if [[ "$(uname -m)" == "arm64" ]]; then
            echo -e "${GREEN}Running on Apple Silicon (M1/M2/M3) with Metal support.${NC}"
            return 0
        elif [[ "$(system_profiler SPDisplaysDataType 2>/dev/null | grep -i 'Chipset Model' | wc -l)" -gt 0 ]]; then
            echo -e "${GREEN}Found Intel GPU with Metal support.${NC}"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}No supported GPU found or drivers not properly configured. Falling back to CPU.${NC}"
    return 1
}

# Function to install Docker
install_docker() {
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    
    if is_macos; then
        echo -e "${YELLOW}Please install Docker Desktop for macOS from: https://www.docker.com/products/docker-desktop${NC}"
        open "https://www.docker.com/products/docker-desktop"
        read -p "Press Enter after Docker Desktop is installed and running..."
    elif is_linux; then
        # Install Docker on Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo -e "${YELLOW}Docker installed. Please log out and log back in for group changes to take effect.${NC}"
        exit 1
    else
        echo -e "${RED}Unsupported operating system. Please install Docker manually.${NC}"
        exit 1
    fi
}

# Function to install Ollama
install_ollama() {
    echo -e "${YELLOW}Ollama not found. Installing Ollama...${NC}"
    
    if is_macos; then
        curl -fsSL https://ollama.com/install.sh | sh
    elif is_linux; then
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo -e "${RED}Unsupported operating system. Please install Ollama manually from https://ollama.ai${NC}"
        exit 1
    fi
    
    # Start Ollama service
    if is_linux; then
        sudo systemctl enable ollama
        sudo systemctl start ollama
    fi
    
    # Add Ollama to PATH if not already there
    if ! echo "$PATH" | grep -q "\.ollama"; then
        echo 'export PATH=$PATH:$HOME/.ollama/bin' >> ~/.bashrc
        export PATH=$PATH:$HOME/.ollama/bin
    fi
    
    echo -e "${GREEN}Ollama installed successfully!${NC}
"
}

# Function to check and install requirements
check_requirements() {
    # Check for Docker
    if ! command_exists docker; then
        install_docker
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Docker is not running. Please start Docker Desktop and try again.${NC}"
        exit 1
    fi
    
    # Check for Ollama
    if ! command_exists ollama; then
        install_ollama
    fi
    
    # Check for NVIDIA Container Toolkit if on Linux with NVIDIA GPU
    if is_linux && has_working_gpu && command_exists nvidia-smi; then
        if ! docker info 2>/dev/null | grep -q "nvidia"; then
            echo -e "${YELLOW}GPU detected but NVIDIA Container Toolkit not configured.${NC}"
            read -p "Would you like to try setting up NVIDIA Container Toolkit? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Setting up NVIDIA Container Toolkit...${NC}"
                distribution=$(. /etc/os-release;echo $ID$VERSION_ID) && \
                curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - && \
                curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
                sudo apt-get update && \
                sudo apt-get install -y nvidia-docker2 && \
                sudo systemctl restart docker
                echo -e "${GREEN}NVIDIA Container Toolkit installed and Docker restarted.${NC}\n"
            else
                echo -e "${YELLOW}No GPU detected. Starting with CPU support...${NC}"
                docker-compose down -v --remove-orphans
                docker-compose up --build
            fi
        fi
    fi
}

# Main execution
main() {
    echo -e "${GREEN}=== Starting Setup ===${NC}"
    
    # Check and install requirements
    check_requirements
    
    # Pull the Mistral model
    pull_mistral
    
    # Start the application
    start_application
}

# Run the main function
main "$@"
