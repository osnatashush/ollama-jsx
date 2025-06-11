#!/bin/bash

# Set up directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"
MODELS_DIR="$BACKEND_DIR/models"
VENV_DIR="$BACKEND_DIR/venv"

# Activate virtual environment
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtual environment not found. Please run install_whisper.sh first."
    exit 1
fi
source "$VENV_DIR/bin/activate"

# Create models directory if it doesn't exist
mkdir -p "$MODELS_DIR"

# Create a test script
cat > "$BACKEND_DIR/test_sentence_transformers.py" << 'EOL'
import os
from pathlib import Path
from sentence_transformers import SentenceTransformer
import torch

# Set up directories
models_dir = Path("./models")
model_name = "sentence-transformers/all-MiniLM-L6-v2"
model_path = models_dir / "sentence-transformers_all-MiniLM-L6-v2"

# Set environment variables
os.environ["TRANSFORMERS_CACHE"] = str(models_dir)
os.environ["HF_HOME"] = str(models_dir / "huggingface")
os.environ["HF_DATASETS_CACHE"] = str(models_dir / "datasets")

print("🔍 Testing Sentence Transformers model...")

# Download and test the model
print(f"⬇️  Downloading {model_name} (this may take a while)...")
try:
    # Check if model is already downloaded
    if model_path.exists():
        print("✅ Model already exists, loading from cache...")
        model = SentenceTransformer(str(model_path))
    else:
        print("Downloading model for the first time...")
        model = SentenceTransformer(model_name)
        model.save(str(model_path))
    
    # Test the model
    print("🧪 Testing model with sample text...")
    embeddings = model.encode("This is a test sentence.")
    print(f"✅ Model test successful! Embedding size: {len(embeddings)}")
    print(f"📁 Model files are saved to: {model_path}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)
EOL

# Install required package if not already installed
echo "📦 Checking for sentence-transformers package..."
pip show sentence-transformers >/dev/null 2>&1 || {
    echo "Installing sentence-transformers..."
    pip install sentence-transformers
}

# Run the test script
echo "🚀 Running Sentence Transformers test..."
python "$BACKEND_DIR/test_sentence_transformers.py"

# Clean up
echo "🧹 Cleaning up..."
rm -f "$BACKEND_DIR/test_sentence_transformers.py"

echo "\n🎉 Setup complete! The sentence-transformers model is ready to use."
echo "   Make sure to activate the virtual environment before running your application:"
echo "   source $VENV_DIR/bin/activate"
