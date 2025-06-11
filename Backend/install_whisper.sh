#!/bin/bash

# Set up directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"
VENV_DIR="$BACKEND_DIR/venv"

# Create and activate virtual environment
echo "🚀 Setting up Python virtual environment..."
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Upgrade pip and install required packages
echo "📦 Installing required packages..."
pip install --upgrade pip
pip install faster-whisper

# Create a test script
cat > "$BACKEND_DIR/test_whisper.py" << 'EOL'
import os
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from faster_whisper import WhisperModel

# Set up directories
models_dir = Path("./models")
models_dir.mkdir(exist_ok=True)

# Set environment variables
os.environ["TRANSFORMERS_CACHE"] = str(models_dir)
os.environ["HF_HOME"] = str(models_dir / "huggingface")
os.environ["HF_DATASETS_CACHE"] = str(models_dir / "datasets")

print("🔍 Testing Whisper model...")

# Create a test audio file
test_audio = "test.wav"
sample_rate = 16000
audio = np.zeros(sample_rate, dtype=np.float32)
wavfile.write(test_audio, sample_rate, audio)
print(f"✅ Created test audio file: {test_audio}")

# Download and test the model
print("⬇️  Downloading Whisper tiny model (this may take a while)...")
try:
    model = WhisperModel(
        "tiny",
        device="cpu",
        compute_type="int8",
        download_root=str(models_dir / "whisper-tiny")
    )
    print("✅ Successfully downloaded Whisper model")
    
    # Test transcription
    print("🎤 Testing transcription...")
    segments, info = model.transcribe(test_audio, beam_size=5)
    print(f"✅ Detected language: {info.language}")
    print("\n🎉 Whisper model is working correctly!")
    
    # Print model location
    model_dir = models_dir / "whisper-tiny"
    print(f"\n📁 Model files are saved to: {model_dir}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)
EOL

# Run the test script
echo "🚀 Running Whisper model test..."
python "$BACKEND_DIR/test_whisper.py"

# Clean up
echo "🧹 Cleaning up..."
rm -f "$BACKEND_DIR/test_whisper.py"
rm -f "$BACKEND_DIR/test.wav"

echo "\n🎉 Setup complete! To use Whisper in your application, activate the virtual environment with:"
echo "   source $VENV_DIR/bin/activate"
