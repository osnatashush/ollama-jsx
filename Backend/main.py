import os
import sys
import logging
import tempfile
import time
import requests
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydub import AudioSegment

# Local imports
from vector_store import store_pdf
from rag import answer_question

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Set environment variables for offline mode
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_DATASETS_OFFLINE'] = '1'
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['HF_EVALUATE_OFFLINE'] = '1'
os.environ['NO_PROXY'] = '*'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

def create_app():
    app = FastAPI(
        title="Ollama JSX Backend",
        description="Backend service for Ollama JSX application",
        version="1.0.0"
    )

    # Allow CORS for frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app

def wait_for_ollama():
    """Wait for Ollama to be ready and the model to be available."""
    ollama_host = os.getenv('OLLAMA_HOST', 'localhost')
    ollama_port = os.getenv('OLLAMA_PORT', '11434')
    base_url = f"http://{ollama_host}:{ollama_port}"
    
    # Wait for Ollama to be ready
    max_retries = 30
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            # Check if Ollama is running
            response = requests.get(f"{base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                # Check if the model is downloaded
                models = response.json().get('models', [])
                model_names = [model.get('name', '') for model in models]
                if any('mistral' in name for name in model_names):
                    logging.info("Ollama is ready and Mistral model is available")
                    return True
                else:
                    # Try to pull the model if not found
                    logging.info("Mistral model not found, attempting to pull...")
                    pull_response = requests.post(
                        f"{base_url}/api/pull",
                        json={"name": "mistral"},
                        timeout=300  # 5 minutes timeout for the pull
                    )
                    if pull_response.status_code == 200:
                        logging.info("Successfully pulled Mistral model")
                        return True
            
            if attempt < max_retries - 1:
                logging.info(f"Ollama not ready, retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
        except (requests.RequestException, ConnectionError) as e:
            if attempt < max_retries - 1:
                logging.warning(f"Error connecting to Ollama: {e}, retrying... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                logging.error(f"Failed to connect to Ollama after {max_retries} attempts")
                return False
    
    return False

app = create_app()

# Check Ollama status on startup
if not wait_for_ollama():
    logging.error("Failed to connect to Ollama or pull the Mistral model. The application may not work correctly.")
    # Don't exit here, as the health check will fail and Docker will restart the container

def get_ollama_base_url():
    """Get the base URL for Ollama API"""
    ollama_host = os.getenv('OLLAMA_HOST', 'host.docker.internal')
    ollama_port = os.getenv('OLLAMA_PORT', '11434')
    return f"http://{ollama_host}:{ollama_port}"

def check_ollama_status():
    """Check if Ollama is available and the model is loaded"""
    max_retries = 3
    retry_delay = 2  # seconds
    
    # Get host and port at the start of the function
    ollama_host = os.getenv('OLLAMA_HOST', 'host.docker.internal')
    ollama_port = os.getenv('OLLAMA_PORT', '11434')
    
    for attempt in range(max_retries):
        try:
            base_url = f"http://{ollama_host}:{ollama_port}"
            url = f"{base_url}/api/tags"
            
            logging.info(f"Attempt {attempt + 1}/{max_retries}: Checking Ollama at: {url}")
            
            # Make the request with a timeout
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse the response
            models = response.json().get('models', [])
            model_names = [model.get('name', '') for model in models]
            has_mistral = any('mistral' in name.lower() for name in model_names)
            
            logging.info(f"Successfully connected to Ollama. Found models: {model_names}")
            
            if not has_mistral:
                logging.warning("Mistral model not found. Available models: %s", model_names)
                # Try to pull the model if not found
                try:
                    logging.info("Attempting to pull mistral model...")
                    import subprocess
                    subprocess.run(["ollama", "pull", "mistral"], check=True)
                    has_mistral = True
                except Exception as e:
                    logging.error(f"Failed to pull mistral model: {e}")
            
            return {
                "ollama_available": True,
                "mistral_loaded": has_mistral,
                "models": model_names,
                "ollama_host": ollama_host,
                "ollama_port": ollama_port
            }
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Failed to connect to Ollama at {url}: {str(e)}"
            if attempt < max_retries - 1:  # Don't log the final retry as an error yet
                logging.warning(f"{error_msg} - Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                continue
            
            logging.error(error_msg)
            return {
                "ollama_available": False,
                "mistral_loaded": False,
                "error": error_msg,
                "ollama_host": ollama_host,
                "ollama_port": ollama_port,
                "suggestion": "Make sure Ollama is running and accessible at the specified host/port"
            }
            
    # This should never be reached due to the loop structure, but just in case
    return {
        "ollama_available": False,
        "mistral_loaded": False,
        "error": "Max retries exceeded when connecting to Ollama",
        "suggestion": "Check if Ollama is running and the host/port is correct"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ollama_status = check_ollama_status()
    
    if not ollama_status["ollama_available"]:
        error_msg = ollama_status.get("error", "Ollama service not available")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": error_msg,
                "details": ollama_status
            }
        )
        
    if not ollama_status["mistral_loaded"]:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": "Mistral model not loaded",
                "available_models": ollama_status.get("models", [])
            }
        )
    
    return {
        "status": "healthy",
        "ollama_available": True,
        "mistral_loaded": True,
        "models": ollama_status.get("models", [])
    }

@app.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
    store_pdf(content, file.filename)
    return {"status": "uploaded"}

class AskRequest(BaseModel):
    question: str

@app.post("/voice")
async def voice(file: UploadFile):
    """Handle voice input, transcribe it, and get a response"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )

    logger.info(f"Processing voice file: {file.filename}")
    
    # Validate file type
    allowed_extensions = {'.wav', '.mp3', '.ogg', '.flac', '.m4a'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        )

    # Create temp file with original extension
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
            logger.debug(f"Saved uploaded file to {tmp_path}")
            
        # Convert to WAV if needed
        wav_path = tmp_path
        if file_ext != ".wav":
            try:
                logger.debug(f"Converting {file_ext} to WAV format")
                audio = AudioSegment.from_file(tmp_path)
                wav_path = f"{os.path.splitext(tmp_path)[0]}.wav"
                audio.export(wav_path, format="wav")
                logger.debug(f"Converted to WAV: {wav_path}")
            except Exception as e:
                logger.error(f"Error converting audio: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not process audio file: {str(e)}"
                )

        # Transcribe with faster-whisper using local model
        try:
            from faster_whisper import WhisperModel
            
            model_path = "./models/whisper-tiny"
            os.makedirs(model_path, exist_ok=True)
            
            logger.info("Loading Whisper model...")
            model = WhisperModel(
                "tiny",
                device="cpu",
                compute_type="int8",
                download_root=model_path,
                local_files_only=True
            )
            
            logger.info("Transcribing audio...")
            segments, info = model.transcribe(
                wav_path,
                language="en",
                beam_size=5,
                vad_filter=True
            )
            
            transcription = "".join([segment.text for segment in segments]).strip()
            logger.info(f"Transcription: {transcription}")

            if not transcription:
                logger.warning("Received empty transcription from Whisper")
                return {
                    "transcription": "", 
                    "response": "Could not transcribe audio. The audio might be too short or contain no speech."
                }
                
            # Pass transcription to RAG logic
            logger.info("Getting response from RAG...")
            response = answer_question(transcription)
            return {
                "transcription": transcription, 
                "response": response
            }
            
        except Exception as e:
            logger.error(f"Error in speech-to-text: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Speech-to-text processing failed. Please ensure all models are downloaded correctly."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the request."
        )
    finally:
        # Clean up temporary files
        for path in [tmp_path, wav_path] if 'tmp_path' in locals() and 'wav_path' in locals() and tmp_path != wav_path else []:
            try:
                if path and os.path.exists(path):
                    os.unlink(path)
                    logger.debug(f"Cleaned up temp file: {path}")
            except Exception as e:
                logger.warning(f"Error cleaning up temp file {path}: {e}")

@app.post("/ask")
async def ask_question(request: AskRequest):
    answer = answer_question(request.question)
    return {"answer": answer}
