# Local RAG Application with Ollama and Whisper

This application provides a local RAG (Retrieval-Augmented Generation) system using Ollama for text generation and Whisper for speech-to-text. It's designed to work completely offline once set up.

## 🚀 Features

- **Local LLM**: Uses Ollama with Mistral model for text generation
- **Speech-to-Text**: Local Whisper model for transcribing audio
- **Document Processing**: Upload and query documents using RAG
- **Offline-First**: All models run locally on your machine
- **Modern Web Interface**: Built with React and FastAPI
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Docker Support**: Containerized setup for easy deployment

## 🐳 Docker Setup (Recommended)

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.ai/) (will be automatically started if not running)
- At least 8GB free RAM (16GB recommended)
- At least 5GB free disk space for models

### Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repository-url>
   cd ollama-jsx
   ```

2. **Make the start script executable** (Linux/macOS):
   ```bash
   chmod +x start-clean.sh
   ```

3. **Run the application**:
   ```bash
   ./start-clean.sh
   ```

   The script will:
   - Check if Docker is running
   - Start Ollama if not already running
   - Pull the Mistral model if not available
   - Build and start the application containers

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8006
   - Ollama: http://localhost:11434

### Docker Commands

- **Start the application**:
  ```bash
  docker-compose up -d
  ```

- **View logs**:
  ```bash
  docker-compose logs -f
  ```

- **Stop the application**:
  ```bash
  docker-compose down
  ```

- **Rebuild containers** (after code changes):
  ```bash
  docker-compose up --build -d
  ```

## 🖥️ Manual Setup (Alternative)

If you prefer to run the application without Docker, see [MANUAL_SETUP.md](MANUAL_SETUP.md) for instructions.

## 📚 Using the Application

### Uploading Documents
1. Click on "Upload Documents"
2. Select one or more PDF, TXT, or DOCX files
3. Wait for the upload and processing to complete

### Asking Questions
1. Type your question in the chat input
2. Press Enter or click the send button
3. The system will retrieve relevant information and generate a response

### Voice Input
1. Click the microphone icon
2. Speak your question clearly
3. Click the stop button when finished
4. The system will transcribe and process your question

## 🛠️ Advanced Configuration

### Environment Variables

You can customize the following environment variables in the `docker-compose.yml` file:

```yaml
services:
  backend:
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      - OLLAMA_HOST=host.docker.internal
      - OLLAMA_PORT=11434
      - TRANSFORMERS_CACHE=/app/models
      - HF_HOME=/app/models/huggingface
      - HF_DATASETS_CACHE=/app/models/datasets
```

### Persistent Storage

By default, the application stores models and data in the following Docker volumes:
- `ollama-jsx_backend-data` - Backend application data
- `ollama-jsx_models` - Downloaded models

To completely remove all data:
```bash
docker-compose down -v
```
```

### Changing the LLM Model

Edit `Backend/rag.py` and update the `OLLAMA_MODEL` constant:

```python
OLLAMA_MODEL = "mistral:latest"  # Change to any model you have downloaded with Ollama
```

## 🔍 Troubleshooting

### Ollama Not Found
```
Error: Ollama server is not running
```

Make sure Ollama is installed and running:
```bash
ollama serve
```

### Model Not Found
```
Error: Model not found
```

Download the required model:
```bash
ollama pull mistral:latest
```

### Port Already in Use
```
Error: [Errno 48] Address already in use
```

Change the port in `uvicorn` command:
```bash
uvicorn main:app --reload --port 8001
```

## 📂 Project Structure

```
ollama-jsx/
├── Backend/               # FastAPI backend
│   ├── models/            # Local model storage
│   ├── main.py            # Main FastAPI application
│   ├── rag.py             # RAG implementation
│   ├── vector_store.py    # Vector store management
│   └── requirements.txt   # Python dependencies
├── Frontend/              # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
└── README-INSTRUCTIONS.md # This file
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.
