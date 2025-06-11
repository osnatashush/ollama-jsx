import sys
import sys
import sys
import shutil
from pathlib import Path
import logging
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('download_models.log')
    ]
)
logger = logging.getLogger(__name__)

# Constants
MODELS_DIR = Path("./models")
SENTENCE_TRANSFORMERS_DIR = MODELS_DIR / "sentence-transformers_all-MiniLM-L6-v2"
WHISPER_DIR = MODELS_DIR / "whisper-tiny"

def run_command(command, cwd=None):
    """Run a shell command with error handling"""
    try:
        logger.info(f"Running: {' '.join(command)}")
        result = subprocess.run(
            command,
            cwd=cwd,
            check=True,
            text=True,
            capture_output=True
        )
        if result.stdout:
            logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed with error: {e.stderr}")
        return False

def download_sentence_transformer():
    """Download and cache the sentence transformer model"""
    temp_script = None
    try:
        logger.info("Downloading sentence-transformers/all-MiniLM-L6-v2...")
        
        # Create a temporary directory for our scripts
        temp_dir = Path("temp_scripts").absolute()
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Create a temporary script to download the model
        script = """
from sentence_transformers import SentenceTransformer
from pathlib import Path
import os
import sys

# Set cache directories
cache_dir = os.path.join(os.getcwd(), "sentence_transformers_cache")
os.makedirs(cache_dir, exist_ok=True)

# Download model
model_name = "sentence-transformers/all-MiniLM-L6-v2"
model = SentenceTransformer(model_name, cache_folder=cache_dir)

# Print the cache directory where the model is stored
print(f"MODEL_CACHE_DIR:{cache_dir}")

# Test the model to ensure it's working
try:
    embeddings = model.encode("test sentence")
    print("Model test successful")
except Exception as e:
    print(f"Model test failed: {e}", file=sys.stderr)
    sys.exit(1)
        """
        
        # Create the script file
        temp_script = temp_dir / "download_st.py"
        with open(temp_script, 'w', encoding='utf-8') as f:
            f.write(script)
            
        logger.info(f"Created temporary script at: {temp_script}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Script absolute path: {temp_script.absolute()}")
        
        # Run the script in a clean environment
        env = os.environ.copy()
        env['TRANSFORMERS_CACHE'] = str(MODELS_DIR.absolute())
        env['HF_HOME'] = str(MODELS_DIR.absolute() / 'huggingface')
        env['HF_DATASETS_CACHE'] = str(MODELS_DIR.absolute() / 'datasets')
        
        logger.info("Running model download script...")
        result = subprocess.run(
            [sys.executable, str(temp_script.absolute())],
            cwd=temp_dir,
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"Failed to download sentence transformer: {result.stderr}")
            return False
        
        # Find the cache directory from the output
        cache_dir = None
        for line in result.stdout.split('\n'):
            if line.startswith('MODEL_CACHE_DIR:'):
                cache_dir = line.split('MODEL_CACHE_DIR:')[1].strip()
                break
                
        if not cache_dir or not os.path.exists(cache_dir):
            logger.error("Could not determine model cache directory")
            logger.error(f"Script output: {result.stdout}")
            logger.error(f"Script error: {result.stderr}")
            return False
            
        # Find the actual model directory
        model_dir = None
        for root, dirs, files in os.walk(cache_dir):
            if 'config.json' in files and 'pytorch_model.bin' in files:
                model_dir = root
                break
                
        if not model_dir:
            logger.error("Could not find model files in cache directory")
            return False
            
        # Copy to our target directory
        if SENTENCE_TRANSFORMERS_DIR.exists():
            shutil.rmtree(SENTENCE_TRANSFORMERS_DIR)
            
        shutil.copytree(model_dir, SENTENCE_TRANSFORMERS_DIR)
        logger.info(f"Model saved to {SENTENCE_TRANSFORMERS_DIR}")
        
        # Verify the model can be loaded
        try:
            from sentence_transformers import SentenceTransformer
            test_model = SentenceTransformer(str(SENTENCE_TRANSFORMERS_DIR))
            test_emb = test_model.encode("test sentence")
            logger.info("Model verification successful")
            return True
        except Exception as e:
            logger.error(f"Failed to verify model: {str(e)}")
            return False
        
    except Exception as e:
        logger.error(f"Error downloading sentence transformer: {str(e)}")
        return False
    finally:
        if 'temp_script' in locals() and os.path.exists(temp_script):
            os.unlink(temp_script)

def download_whisper():
    """Download and cache the Whisper model"""
    temp_script = None
    test_audio = None
    try:
        logger.info("Downloading Whisper tiny model...")
        
        # Create a temporary directory for our scripts
        temp_dir = Path("temp_scripts").absolute()
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Create a temporary script to download the model
        script = """
import os
import sys
import warnings
from pathlib import Path

# Suppress warnings
warnings.filterwarnings('ignore')

# Set cache directory
cache_dir = os.path.join(os.getcwd(), "whisper_cache")
model_dir = os.path.join(cache_dir, "models--guillaumekln--faster-whisper-tiny")

# Create cache directory if it doesn't exist
os.makedirs(cache_dir, exist_ok=True)

print(f"WHISPER_CACHE_DIR:{cache_dir}")
print(f"WHISPER_MODEL_DIR:{model_dir}")

try:
    # Import whisper after setting environment variables
    from faster_whisper import WhisperModel
    
    # Try to load the model
    model = WhisperModel(
        "tiny",
        device="cpu",
        compute_type="int8",
        download_root=cache_dir
    )
    
    # Test the model with a simple audio file
    test_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test.wav")
    if not os.path.exists(test_file):
        raise FileNotFoundError(f"Test audio file not found at {test_file}")
    
    # Test transcription
    segments = list(model.transcribe(test_file, beam_size=5))
    if not segments:
        raise ValueError("No transcription results from Whisper model")
    
    print("Whisper model test successful")
    
    # Verify model files exist
    required_files = [
        "config.json",
        "preprocessor_config.json",
        "tokenizer.json",
        "tokenizer_config.json"
    ]
    
    model_files = os.listdir(os.path.join(model_dir, "snapshots"))
    if not model_files:
        raise FileNotFoundError("No model files found in the cache directory")
    
    model_snapshot = os.path.join(model_dir, "snapshots", model_files[0])
    for file in required_files:
        if not os.path.exists(os.path.join(model_snapshot, file)):
            raise FileNotFoundError(f"Required model file {file} not found")
    
    print(f"MODEL_VERIFIED: {model_snapshot}")
    
except Exception as e:
    print(f"Whisper model test failed: {e}", file=sys.stderr)
    sys.exit(1)
        """
        
        # Create the script file
        temp_script = temp_dir / "download_whisper.py"
        with open(temp_script, 'w', encoding='utf-8') as f:
            f.write(script)
            
        logger.info(f"Created temporary script at: {temp_script}")
        
        # Create a test audio file
        test_audio = temp_dir / "test.wav"
        with open(test_audio, 'wb') as f:
            # Create a minimal WAV file header (44 bytes)
            f.write(b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00')
            f.write(b'\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00')
        
        # Set up environment variables
        env = os.environ.copy()
        env['HF_HOME'] = str(MODELS_DIR.absolute() / 'huggingface')
        env['TRANSFORMERS_CACHE'] = str(MODELS_DIR.absolute())
        env['HF_DATASETS_CACHE'] = str(MODELS_DIR.absolute() / 'datasets')
        
        # Run the script
        logger.info("Running Whisper download script...")
        result = subprocess.run(
            [sys.executable, str(temp_script.absolute())],
            cwd=temp_dir,
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"Failed to download Whisper model: {result.stderr}")
            return False
            
        # Find the model directory from the output
        model_dir = None
        model_verified = False
        model_snapshot = None
        
        for line in result.stdout.split('\n'):
            if line.startswith('WHISPER_MODEL_DIR:'):
                model_dir = line.split('WHISPER_MODEL_DIR:')[1].strip()
            elif line.startswith('MODEL_VERIFIED:'):
                model_snapshot = line.split('MODEL_VERIFIED:')[1].strip()
                model_verified = True
        
        if not model_verified or not model_snapshot or not os.path.exists(model_snapshot):
            logger.error("Failed to verify Whisper model download")
            logger.error(f"Model verified: {model_verified}")
            logger.error(f"Model snapshot: {model_snapshot}")
            logger.error(f"Script output: {result.stdout}")
            logger.error(f"Script error: {result.stderr}")
            return False
            
        logger.info(f"Verified model snapshot at: {model_snapshot}")
            
        # Copy to our target directory
        whisper_target_dir = MODELS_DIR / "whisper-tiny"
        if whisper_target_dir.exists():
            shutil.rmtree(whisper_target_dir)
            
        shutil.copytree(model_dir, whisper_target_dir)
        logger.info(f"Whisper model saved to {whisper_target_dir}")
        
        # Verify the model can be loaded
        try:
            from faster_whisper import WhisperModel
            test_model = WhisperModel(
                str(whisper_target_dir / "tiny"),
                device="cpu",
                compute_type="int8"
            )
            logger.info("Whisper model verification successful")
            return True
        except Exception as e:
            logger.error(f"Failed to verify Whisper model: {str(e)}")
            return False
            
    except Exception as e:
        logger.error(f"Error downloading Whisper model: {str(e)}", exc_info=True)
        return False
        
    finally:
        # Clean up temporary files
        try:
            if 'temp_script' in locals() and temp_script and temp_script.exists():
                os.unlink(temp_script)
            if 'test_audio' in locals() and test_audio and test_audio.exists():
                os.unlink(test_audio)
        except Exception as e:
            logger.warning(f"Error cleaning up temporary files: {e}")

def main():
    """Main function to download all required models"""
    try:
        # Create models directory
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Download models
        success = True
        
        if not download_sentence_transformer():
            logger.error("Failed to download sentence transformer model")
            success = False
            
        if not download_whisper():
            logger.error("Failed to download Whisper model")
            success = False
            
        if success:
            logger.info("All models downloaded successfully!")
            print("\n✅ Setup completed successfully!")
            print(f"Models are saved in: {MODELS_DIR.absolute()}")
            print("You can now run the application offline.")
        else:
            logger.error("Some models failed to download")
            print("\n❌ Some models failed to download. Check the logs for details.")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(f"\n❌ An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting model download process...")
    print(f"📁 Models will be saved to: {MODELS_DIR.absolute()}")
    print("This may take a while depending on your internet connection.\n")
    main()
