# Local RAG Application with Ollama and Whisper

This application provides a local RAG (Retrieval-Augmented Generation) system using Ollama for text generation and Whisper for speech-to-text. It's designed to work completely offline once set up.

## 🚀 Features

- **Local LLM**: Uses Ollama with Mistral model for text generation
- **Speech-to-Text**: Local Whisper model for transcribing audio
- **Document Processing**: Upload and query documents using RAG
- **Offline-First**: All models run locally on your machine
- **Modern Web Interface**: Built with React and FastAPI
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Easy Setup**: Single-command startup with automatic dependency management

## 🛠️ Prerequisites

- Docker and Docker Compose
- Ollama (will be automatically started if not running)
- At least 8GB free RAM (16GB recommended)
- At least 5GB free disk space for models

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ollama-jsx
```

### 2. Start the Application

Run the startup script (will handle everything automatically):

#### On macOS/Linux:
```bash
python3 start.py
```

#### On Windows:
```bash
python start.py
```

The script will:
1. Check for and install FFmpeg if needed
2. Start Ollama (or use existing instance)
3. Build and start the application using Docker Compose

The application will be available at `http://localhost:3000`

### 3. Using the Application

1. **Upload Documents**:
   - Click "Upload Documents"
   - Select PDF, TXT, or DOCX files
   - Wait for processing to complete

2. **Ask Questions**:
   - Type your question in the chat
   - Or use the microphone for voice input
   - Get answers powered by local LLM with RAG

## 🔧 Manual Setup (Alternative)

If you prefer not to use Docker, follow the manual setup instructions in [MANUAL_SETUP.md](MANUAL_SETUP.md).

## 🌐 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8006
- **Ollama**: http://localhost:11434

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

Create a `.env` file in the Backend directory with:

```env
TRANSFORMERS_CACHE="./models"
HF_HOME="./models/huggingface"
HF_DATASETS_CACHE="./models/datasets"
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
