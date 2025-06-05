from fastapi import FastAPI, UploadFile, Form
from vector_store import store_pdf
from rag import answer_question

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
    store_pdf(content, file.filename)
    return {"status": "uploaded"}

@app.post("/ask")
async def ask_question(question: str = Form(...)):
    answer = answer_question(question)
    return {"answer": answer}
