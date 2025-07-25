import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
import pinecone

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Get keys
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'temp_upload')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    pdf_file = request.files['pdf']
    save_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    pdf_file.save(save_path)

    return jsonify({'status': 'uploaded', 'saved_filename': pdf_file.filename})

@app.route('/ingest_pdf', methods=['POST'])
def ingest_pdf():
    data = request.get_json()
    filename = data.get('filename')
    pdf_path = os.path.join(UPLOAD_DIR, filename)

    # Extract text
    doc = fitz.open(pdf_path)
    text = "".join([page.get_text() for page in doc])

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    # Init Pinecone
    pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
    if PINECONE_INDEX_NAME not in pinecone.list_indexes():
        pinecone.create_index(PINECONE_INDEX_NAME, dimension=1536)
    index = pinecone.Index(PINECONE_INDEX_NAME)

    # Embed and store
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    Pinecone.from_texts(chunks, embedding=embeddings, index_name=PINECONE_INDEX_NAME)

    return jsonify({'status': 'indexed', 'chunks': len(chunks)})

if __name__ == '__main__':
    app.run(debug=True)
