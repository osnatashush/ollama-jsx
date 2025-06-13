
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
        