from app.embeddings.extractor import extract_text_from_pdf
from app.embeddings.embedder import embed_and_upsert

def process_and_upload(file_path: str):
    text = extract_text_from_pdf(file_path)
    print("[INFO] Starting embedding process...")
    print("[INFO] Extracted text:", text[:500])  # Preview first 500 chars

    return embed_and_upsert(text)
