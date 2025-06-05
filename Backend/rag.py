from vector_store import build_index
from llama_index.llms.ollama import Ollama

def answer_question(question):
    index = build_index()
    llm = Ollama(model="mistral:latest", base_url="http://localhost:11434", request_timeout=120,
    stream=False)
    query_engine = index.as_query_engine(llm=llm)
    response = query_engine.query(question)
    return response.response
