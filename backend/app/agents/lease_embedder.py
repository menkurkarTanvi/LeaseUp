import os
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI
from uuid import uuid4
from PyPDF2 import PdfReader

load_dotenv()

# Setup API keys
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() or ""
    return full_text.strip()

def process_and_upload(file_path: str) -> str:
    text = extract_text_from_pdf(file_path)

    if not text:
        raise ValueError("No extractable text found in PDF.")

    # Generate embeddings with the new SDK
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    vector = response.data[0].embedding
    vector_id = str(uuid4())

    index.upsert([(vector_id, vector, {"filename": os.path.basename(file_path)})])
    return vector_id
