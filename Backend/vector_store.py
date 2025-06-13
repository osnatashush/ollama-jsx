import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from pathlib import Path
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set environment variables to use local files only and prevent all network access
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_DATASETS_OFFLINE'] = '1'
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['HF_EVALUATE_OFFLINE'] = '1'
os.environ['NO_PROXY'] = '*'  # Block all proxy connections

# Disable tokenizers parallelism to avoid warnings
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

db = chromadb.Client()
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def store_pdf(content, filename):
    file_path = DATA_DIR / filename
    with open(file_path, "wb") as f:
        f.write(content)

def get_embedding_model():
    """Get the embedding model with offline configuration"""
    try:
        model_path = os.path.abspath("./models/sentence-transformers_all-MiniLM-L6-v2")
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at {model_path}. "
                "Please run 'python download_models.py' while online first."
            )
            
        logger.info(f"Loading embedding model from {model_path}")
        return HuggingFaceEmbedding(
            model_name=model_path,
            cache_folder="./models",
            trust_remote_code=True,
            model_kwargs={"local_files_only": True}
        )
    except Exception as e:
        logger.error(f"Failed to load embedding model: {str(e)}")
        raise

def build_index():
    """Build the vector index using local models only"""
    try:
        logger.info("Loading documents...")
        docs = SimpleDirectoryReader(str(DATA_DIR)).load_data()
        
        # Configure settings with local models only
        Settings.embed_model = get_embedding_model()
        
        logger.info("Building index...")
        index = VectorStoreIndex.from_documents(docs)
        logger.info("Index built successfully")
        return index
    except Exception as e:
        logger.error(f"Error building index: {str(e)}")
        raise
