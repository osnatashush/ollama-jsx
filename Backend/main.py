from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vector_store import store_pdf
from rag import answer_question
import tempfile
from pydub import AudioSegment
import os
from faster_whisper import WhisperModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
    store_pdf(content, file.filename)
    return {"status": "uploaded"}

class AskRequest(BaseModel):
    question: str

@app.post("/voice")
async def voice(file: UploadFile):
    # Save uploaded file to a temp file (keep original extension)
    orig_ext = os.path.splitext(file.filename)[-1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=orig_ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Convert to WAV if needed
    wav_path = tmp_path
    if orig_ext != ".wav":
        audio = AudioSegment.from_file(tmp_path)
        wav_path = tmp_path + ".wav"
        audio.export(wav_path, format="wav")

    # Transcribe with faster-whisper using local model
    try:
        model_path = "./models/whisper-tiny"
        os.makedirs(model_path, exist_ok=True)
        
        model = WhisperModel(
            "tiny",
            device="cpu",
            compute_type="int8",
            download_root=model_path,
            local_files_only=True
        )
        
        segments, info = model.transcribe(wav_path)
        transcription = "".join([segment.text for segment in segments]).strip()

        if not transcription:
            logger.warning("Received empty transcription from Whisper")
            return {"transcription": "", "response": "Could not transcribe audio."}
            
    except Exception as e:
        logger.error(f"Error in speech-to-text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Speech-to-text processing failed: {str(e)}"
        )
    finally:
        # Clean up temporary files
        try:
            os.unlink(tmp_path)
            if os.path.exists(wav_path) and wav_path != tmp_path:
                os.unlink(wav_path)
        except Exception as e:
            logger.warning(f"Error cleaning up temp files: {e}")

    # Pass transcription to RAG logic
    response = answer_question(transcription)
    return {"transcription": transcription, "response": response}

@app.post("/ask")
async def ask_question(request: AskRequest):
    answer = answer_question(request.question)
    return {"answer": answer}
