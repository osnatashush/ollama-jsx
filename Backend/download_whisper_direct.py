import os
import sys
import logging
from pathlib import Path
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('download_whisper.log')
    ]
)
logger = logging.getLogger(__name__)

def main():
    try:
        # Set up directories
        models_dir = Path("./models").absolute()
        whisper_dir = models_dir / "whisper-tiny"
        whisper_dir.mkdir(parents=True, exist_ok=True)
        
        # Set environment variables
        os.environ['TRANSFORMERS_CACHE'] = str(models_dir)
        os.environ['HF_HOME'] = str(models_dir / 'huggingface')
        os.environ['HF_DATASETS_CACHE'] = str(models_dir / 'datasets')
        
        logger.info("Downloading Whisper tiny model...")
        
        # Create a simple test script
        script = """
import os
import sys
from faster_whisper import WhisperModel

# Set cache directory
cache_dir = os.path.join(os.getcwd(), "whisper_cache")
os.makedirs(cache_dir, exist_ok=True)

print(f"WHISPER_CACHE_DIR: {cache_dir}")

# Download and load the model
model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8",
    download_root=cache_dir
)
print("Model loaded successfully")

# Test with a dummy audio file
import numpy as np
from scipy.io import wavfile

# Create a 1-second silent audio file
sample_rate = 16000
audio = np.zeros(sample_rate, dtype=np.float32)
wavfile.write("test.wav", sample_rate, audio)

# Test transcription
segments, info = model.transcribe("test.wav", beam_size=5)
print(f"Detected language: {info.language}")
print("Whisper model test successful")
"""
        # Ensure the target directory exists
        whisper_dir.mkdir(parents=True, exist_ok=True)
        
        # Write script to file in the target directory
        script_path = whisper_dir / "test_whisper.py"
        with open(script_path, 'w') as f:
            f.write(script)
            
        logger.info(f"Created test script at: {script_path}")
            
        # Install required package
        logger.info("Installing faster-whisper package...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "faster-whisper"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info("Successfully installed faster-whisper")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install faster-whisper: {e.stderr}")
            raise
        
        # Run the script
        logger.info("Running Whisper test script...")
        logger.info(f"Running command: {[sys.executable, str(script_path)]} in {whisper_dir}")
        
        # Print environment for debugging
        logger.info("Environment variables:")
        for k, v in os.environ.items():
            if any(x in k.lower() for x in ['path', 'python', 'home', 'cache']):
                logger.info(f"  {k}={v}")
        
        try:
            result = subprocess.run(
                [sys.executable, str(script_path)],
                cwd=str(whisper_dir),
                capture_output=True,
                text=True,
                check=True
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Script failed with error: {e}")
            logger.error(f"STDOUT: {e.stdout}")
            logger.error(f"STDERR: {e.stderr}")
            raise
        
        if result.returncode == 0:
            logger.info("Successfully downloaded and tested Whisper model")
            logger.info(result.stdout)
            # Copy the model files to our target directory
            cache_dir = None
            for line in result.stdout.split('\n'):
                if line.startswith('WHISPER_CACHE_DIR:'):
                    cache_dir = line.split('WHISPER_CACHE_DIR:')[1].strip()
                    break
            
            if cache_dir and os.path.exists(cache_dir):
                logger.info(f"Model files cached at: {cache_dir}")
                # The model is already in the cache, no need to copy
                with open(whisper_dir / "success.txt", 'w') as f:
                    f.write(f"Model downloaded successfully to: {cache_dir}")
                return True
            else:
                logger.error("Could not determine cache directory from output")
        else:
            logger.error("Failed to download Whisper model")
            logger.error(f"Error: {result.stderr}")
            
    except Exception as e:
        logger.exception("Error in download_whisper_direct")
    
    return False

if __name__ == "__main__":
    print("🚀 Starting Whisper model download...")
    success = main()
    if success:
        print("✅ Whisper model downloaded successfully!")
    else:
        print("❌ Failed to download Whisper model. Check the logs for details.")
