import os
from openai import OpenAI
import pinecone
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT")
)

index = pinecone.Index(
    os.getenv("PINECONE_INDEX_NAME"),
    environment=os.getenv("PINECONE_ENVIRONMENT")
)

def embed_and_upsert(text: str):
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    
    vector = response.data[0].embedding
    id = str(uuid4())
    
    try:
        index.upsert([(id, vector, {"text": text})])
        print(f"[SUCCESS] Vector with ID {id} upserted.")
    except Exception as e:
        print(f"[ERROR] Pinecone upsert failed: {e}")

    
    print("[INFO] Vector created:", vector[:5])  # Preview
    print("[INFO] Inserting to Pinecone index:", index)
    print("[INFO] Text preview:", text[:200])

    return id
