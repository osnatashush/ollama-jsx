from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vector_store import store_pdf
from rag import answer_question

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
    store_pdf(content, file.filename)
    return {"status": "uploaded"}

class AskRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(request: AskRequest):
    answer = answer_question(request.question)
    return {"answer": answer}
