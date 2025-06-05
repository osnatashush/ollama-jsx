import chromadb
from llama_index import VectorStoreIndex, SimpleDirectoryReader
from pathlib import Path

db = chromadb.Client()
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def store_pdf(content, filename):
    file_path = DATA_DIR / filename
    with open(file_path, "wb") as f:
        f.write(content)

def build_index():
    docs = SimpleDirectoryReader(str(DATA_DIR)).load_data()
    return VectorStoreIndex.from_documents(docs)
