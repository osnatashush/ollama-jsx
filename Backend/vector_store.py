import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from pathlib import Path
import os

# Set environment variables to use local files only
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_DATASETS_OFFLINE'] = '1'

db = chromadb.Client()
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def store_pdf(content, filename):
    file_path = DATA_DIR / filename
    with open(file_path, "wb") as f:
        f.write(content)

def build_index():
    try:
        docs = SimpleDirectoryReader(str(DATA_DIR)).load_data()
        # Use local files only
        embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            cache_folder="./models"
        )
        Settings.embed_model = embed_model
        return VectorStoreIndex.from_documents(docs)
    except Exception as e:
        print(f"Error building index: {str(e)}")
        raise
