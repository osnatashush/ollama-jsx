import os
from pathlib import Path
from sentence_transformers import SentenceTransformer
from faster_whisper import WhisperModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def download_models():
    try:
        # Create models directory
        models_dir = "./models"
        ensure_dir(models_dir)
        
        logger.info("Downloading sentence-transformers/all-MiniLM-L6-v2...")
        # Download sentence transformer model
        SentenceTransformer(
            'sentence-transformers/all-MiniLM-L6-v2',
            cache_folder=models_dir
        )
        
        logger.info("Downloading Whisper tiny model...")
        # Download Whisper model
        whisper_dir = f"{models_dir}/whisper-tiny"
        ensure_dir(whisper_dir)
        
        # This will download the model if not already present
        WhisperModel(
            "tiny",
            device="cpu",
            compute_type="int8",
            download_root=whisper_dir
        )
        
        logger.info("All models downloaded successfully!")
        
    except Exception as e:
        logger.error(f"Error downloading models: {str(e)}")
        raise

if __name__ == "__main__":
    download_models()
