#!/usr/bin/env python3
import os
import sys
import platform
import subprocess
import socket
import time
import signal
from pathlib import Path

def is_port_in_use(port, host='0.0.0.0'):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def find_available_port(start_port, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            return port
    return start_port  # Return original if none available

def install_ffmpeg():
    """Install FFmpeg based on the operating system"""
    system = platform.system().lower()
    
    if system == 'darwin':  # macOS
        print("\n🔧 Checking for Homebrew...")
        if not shutil.which('brew'):
            print("Installing Homebrew...")
            subprocess.run(
                '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
                shell=True, check=True
            )
        print("Installing FFmpeg...")
        subprocess.run(['brew', 'install', 'ffmpeg'], check=True)
        
    elif system == 'windows':
        print("\n🔧 Checking for Chocolatey...")
        if not shutil.which('choco'):
            print("Installing Chocolatey...")
            subprocess.run(
                'Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://chocolatey.org/install.ps1\'))',
                shell=True, check=True
            )
        print("Installing FFmpeg...")
        subprocess.run(['choco', 'install', 'ffmpeg', '-y'], check=True)
        
    elif system == 'linux':
        print("\n🔧 Installing FFmpeg...")
        subprocess.run(['sudo', 'apt-get', 'update'], check=True)
        subprocess.run(['sudo', 'apt-get', 'install', '-y', 'ffmpeg'], check=True)
    else:
        print(f"\n⚠️  Unsupported OS: {system}. Please install FFmpeg manually.")
        return False
    
    print("✅ FFmpeg installed successfully")
    return True

def check_and_start_ollama():
    """Check if Ollama is running, start if not"""
    OLLAMA_PORT = 11434
    
    print("\n🔍 Checking if Ollama is running...")
    
    if is_port_in_use(OLLAMA_PORT):
        print(f"✅ Ollama is already running on port {OLLAMA_PORT}")
        return OLLAMA_PORT
    
    print("🚀 Starting Ollama...")
    
    try:
        if platform.system().lower() == 'windows':
            subprocess.Popen(['ollama', 'serve'], creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen(['ollama', 'serve'])
        
        # Wait for Ollama to start
        max_attempts = 10
        for _ in range(max_attempts):
            if is_port_in_use(OLLAMA_PORT):
                print(f"✅ Ollama started successfully on port {OLLAMA_PORT}")
                return OLLAMA_PORT
            time.sleep(1)
        
        print("⚠️  Ollama might not have started correctly. Please check manually.")
        return OLLAMA_PORT
        
    except FileNotFoundError:
        print("❌ Ollama not found. Please install it from https://ollama.ai/")
        return None

def start_application():
    """Start the application with Docker Compose"""
    # Find available ports
    backend_port = find_available_port(8006)
    frontend_port = find_available_port(3000)
    
    print(f"\n🚀 Starting application with the following configuration:")
    print(f"   - Backend: http://localhost:{backend_port}")
    print(f"   - Frontend: http://localhost:{frontend_port}")
    
    # Set environment variables for Docker Compose
    os.environ['BACKEND_PORT'] = str(backend_port)
    os.environ['FRONTEND_PORT'] = str(frontend_port)
    
    # Start Docker Compose
    docker_compose_cmd = ['docker-compose', 'up', '--build']
    
    try:
        subprocess.run(docker_compose_cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error starting Docker Compose: {e}")
        return False
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
        return True
    
    return True

def main():
    print("🚀 Starting Ollama JSX Setup...")
    
    # Check and install FFmpeg
    try:
        import shutil
        if not shutil.which('ffmpeg'):
            if not install_ffmpeg():
                print("\n⚠️  Failed to install FFmpeg. Some features may not work correctly.")
    except Exception as e:
        print(f"\n⚠️  Error checking/installing FFmpeg: {e}")
    
    # Check and start Ollama
    ollama_port = check_and_start_ollama()
    if ollama_port is None:
        print("\n❌ Ollama is required for this application. Please install it and try again.")
        sys.exit(1)
    
    # Start the application
    print("\n🚀 Starting the application...")
    if not start_application():
        sys.exit(1)

if __name__ == "__main__":
    main()
