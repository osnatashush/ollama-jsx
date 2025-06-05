from vector_store import build_index
import requests

def answer_question(question):
    index = build_index()
    query_engine = index.as_query_engine()
    context = query_engine.query(question).response

    payload = {
        "model": "mistral",
        "prompt": f"הקשר:\n{context}\n\nשאלה: {question}\nתשובה:",
        "stream": False
    }

    r = requests.post("http://localhost:11434/api/generate", json=payload)
    return r.json()["response"]
