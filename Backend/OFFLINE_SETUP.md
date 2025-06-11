# Offline Setup Guide

This guide explains how to set up the application for offline use.

## Prerequisites

1. First, install all dependencies with internet connection:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-models.txt
   ```

2. Download all required models (requires internet connection):
   ```bash
   python download_models.py
   ```
   This will download all necessary models to the `./models` directory.

3. Make sure Ollama is installed and running locally with the required models:
   ```bash
   # Install Ollama if not already installed
   # See: https://ollama.ai/download
   
   # Pull the required model (do this while online)
   ollama pull mistral:latest
   ```

## Running Offline

1. Start the Ollama server (if not already running):
   ```bash
   ollama serve
   ```

2. In a new terminal, start the FastAPI backend:
   ```bash
   uvicorn main:app --reload
   ```

3. The application should now work completely offline, as all models are stored locally.

## Troubleshooting

- If you get model loading errors, ensure you ran `download_models.py` while online
- Check that the Ollama server is running and accessible at `http://localhost:11434`
- Verify that the `mistral:latest` model is available in Ollama by running `ollama list`
- Check the logs for any specific error messages
