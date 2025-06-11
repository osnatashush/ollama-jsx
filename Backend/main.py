import os
import sys
import logging
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException, status
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

app = create_app()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "offline": True}

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
