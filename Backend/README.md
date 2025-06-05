# Ollama RAG Backend

## Overview

This backend is built with FastAPI and is designed for Retrieval-Augmented Generation (RAG) using a vector database. It exposes endpoints for document upload and question answering, integrating with Ollama for LLM responses.

## How to Run the Backend

1. **Install dependencies** (preferably in a virtual environment):

```bash
pip install -r requirements.txt
```

2. **Start the FastAPI server:**

```bash
uvicorn main:app --reload
```

- The server will run at http://127.0.0.1:8006/

## API Endpoints

- `POST /upload` — Upload a PDF file to store in the vector database.
- `POST /ask` — Ask a question (form field: `question`), returns an answer using RAG and Ollama.

## Next Steps

- Implement `vector_store.py` for PDF storage and indexing.
- Connect your frontend to these endpoints for RAG-powered chat.
