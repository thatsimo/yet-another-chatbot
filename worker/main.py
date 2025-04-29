import os
import uvicorn
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from loader import parse_pdf_bytes, parse_excel_bytes, parse_xml_bytes
from embedder import upload_to_pinecone
from agent import run_query_with_verification
from db import create_session, log_file, log_message, get_files, get_messages, get_sessions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatInitResponse(BaseModel):
    session_id: str
    files: list[str]

class ChatResponse(BaseModel):
    answer: str

class SessionData(BaseModel):
    session_id: str
    files: list[str]
    messages: list[dict]

class SessionInfo(BaseModel):
    session_id: str
    created_at: str

@app.post("/chats", response_model=ChatInitResponse)
async def chat_init(
    file: UploadFile = File(...),
):
    session_id = uuid.uuid4().hex
    create_session(session_id)
    content = await file.read()
    ext = file.filename.lower().split('.')[-1]
    if ext == 'pdf':
        text = parse_pdf_bytes(content)
    elif ext in ('xls', 'xlsx'):
        text = parse_excel_bytes(content)
    elif ext == 'xml':
        text = parse_xml_bytes(content)
    else:
        raise HTTPException(400, "Unsupported file type")
    upload_to_pinecone([text], [{"source": file.filename, "text": text}], session_id)
    log_file(session_id, file.filename)
    files = get_files(session_id)
    return ChatInitResponse(session_id=session_id, files=files)

@app.put("/chats/{session_id}", response_model=ChatResponse)
async def chat_continue(
    session_id: str,
    question: str = Form(...)
):
    answer = run_query_with_verification(session_id, question)
    log_message(session_id, question, answer)
    return ChatResponse(answer=answer)

@app.get("/chats/{session_id}", response_model=SessionData)
async def get_chat(session_id: str):
    files = get_files(session_id)
    messages = get_messages(session_id)
    return SessionData(session_id=session_id, files=files, messages=messages)

@app.get("/chats", response_model=list[SessionInfo])
async def list_chats():
    """Return all chat sessions."""
    return get_sessions()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
