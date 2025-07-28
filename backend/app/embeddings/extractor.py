from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    texts = []

    for i, page in enumerate(reader.pages):
        try:
            text = page.extract_text()
            if text:
                texts.append(text)
            else:
                print(f"[WARN] Page {i} has no extractable text.")
        except Exception as e:
            print(f"[ERROR] Failed to extract text from page {i}: {e}")

    full_text = "\n".join(texts).strip()
    
    if not full_text:
        raise ValueError("❌ No extractable text found in the PDF.")

    print(f"[INFO] Extracted {len(texts)} pages with text.")
    return full_text
