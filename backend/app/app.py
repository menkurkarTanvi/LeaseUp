from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.agents.lease_embedder import process_and_upload
from pydantic import BaseModel

app = FastAPI()

#FastAPI route
# CORS settings to allow React (localhost:3000) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

@app.post("/uploads")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()

    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)

    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(contents)

    return {"filename": file.filename}

class SubmitRequest(BaseModel):
    filename: str

@app.post("/submit")
async def submit_to_pinecone(payload: SubmitRequest):
    file_path = f"uploads/{payload.filename}"
    vector_id = process_and_upload(file_path)
    return {"status": "uploaded", "vector_id": vector_id}
