# Offline Implementation Guide

This document explains the technical details of how the application was modified to support offline functionality, including the reasoning behind key design decisions.

## Table of Contents
1. [Core Offline Architecture](#core-offline-architecture)
2. [Model Management](#model-management)
3. [Configuration Changes](#configuration-changes)
4. [Error Handling](#error-handling)
5. [Verification and Testing](#verification-and-testing)
6. [Switching Between Modes](#switching-between-modes)
7. [Troubleshooting](#troubleshooting)

## Core Offline Architecture

### Key Components

1. **Local Model Storage**
   - All AI models are downloaded and cached in `./models`
   - Separate directories for different model types (Whisper, sentence-transformers, etc.)
   - Version-controlled model configurations

2. **Environment Isolation**
   - Python virtual environment for dependency management
   - Isolated Node modules for frontend
   - Clear separation between development and production environments

3. **Service Dependencies**
   - Ollama runs as a local service
   - No external API dependencies for core functionality
   - All data processing happens on-device

## Model Management

### Model Download System

```python
# download_models.py

def download_whisper():
    """Download and verify Whisper model"""
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    # Test model with dummy audio
    audio = np.zeros(16000, dtype=np.float32)
    model.transcribe(audio)
```

**Why this approach?**
- Verifies model functionality immediately after download
- Uses minimal system resources
- Provides immediate feedback if something goes wrong

### Model Caching

```python
# In vector_store.py

# Configure model paths
os.environ["TRANSFORMERS_CACHE"] = "./models"
os.environ["HF_HOME"] = "./models/huggingface"
```

**Why this approach?**
- Standardizes model locations
- Makes it easy to clear or update models
- Works with Hugging Face's default caching system

## Configuration Changes

### Environment Variables

```env
# .env
TRANSFORMERS_OFFLINE=1
HF_HUB_OFFLINE=1
OLLAMA_HOST=127.0.0.1
```

**Key Variables:**
- `TRANSFORMERS_OFFLINE`: Disables Hugging Face hub lookups
- `HF_HUB_OFFLINE`: Prevents any network requests to Hugging Face
- `OLLAMA_HOST`: Ensures Ollama connects locally

### Application Configuration

```python
# In main.py

app = FastAPI(title="Local RAG API",
             description="Fully offline RAG implementation",
             version="1.0.0")
```

## Error Handling

### Graceful Degradation

```python
def get_llm_response(prompt: str) -> str:
    try:
        if not check_ollama_available():
            raise RuntimeError("Ollama service not available")
        return generate_response(prompt)
    except Exception as e:
        logger.error(f"LLM Error: {str(e)}")
        return "I'm having trouble connecting to the AI service. Please check if Ollama is running."
```

**Why this approach?**
- Prevents cryptic errors
- Provides actionable feedback
- Maintains functionality when possible

## Verification and Testing

### Model Verification

```python
def verify_model(model_path: Path) -> bool:
    required_files = ["config.json", "pytorch_model.bin"]
    return all((model_path / file).exists() for file in required_files)
```

### Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "ollama_running": check_ollama_available(),
        "models_loaded": verify_models()
    }
```

## Switching Between Modes

### Development Mode (Online)

```bash
# In .env
TRANSFORMERS_OFFLINE=0
HF_HUB_OFFLINE=0
```

### Production Mode (Offline)

```bash
# In .env
TRANSFORMERS_OFFLINE=1
HF_HUB_OFFLINE=1
```

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Verify model files exist in `./models`
   - Check file permissions
   - Ensure enough disk space is available

2. **Ollama Connection Issues**
   - Verify Ollama is running: `ollama serve`
   - Check if port 11434 is accessible
   - Ensure correct model is downloaded: `ollama pull mistral:latest`

3. **Performance Problems**
   - Check system resource usage
   - Consider using smaller models
   - Verify hardware acceleration is working

## Best Practices

1. **Regularly Update Models**
   ```bash
   # Update models periodically
   python download_models.py --update
   ```

2. **Monitor Disk Usage**
   - Models can take significant space
   - Clean up old model versions when not needed

3. **Security Considerations**
   - Keep the application updated
   - Regularly audit dependencies
   - Use model hashes to verify integrity

## Conclusion

This implementation provides a robust offline experience by:
1. Downloading and verifying all dependencies
2. Using local services where possible
3. Providing clear error messages
4. Making it easy to switch between modes

For additional questions or support, please refer to the main documentation or open an issue in the repository.
