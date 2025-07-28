#Imports
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Define the model and embeddings
from langchain_openai import OpenAIEmbeddings
import os
import dotenv

dotenv.load_dotenv()
#---------------------------------------------------INITIALIZE VECTOR DATABASE------------------------------------------------------------#
pinecone_api_key = "pcsk_2kqyLV_8dDv1FDrLsXQB6BzFrkYCQs8A3fcLbbnHSfT4sF91DyQaUZVuSL7jnh35pThBHi"

#Embeddings model
embeddings = OpenAIEmbeddings(
    api_key="OPEN API KEY",
    model="text-embedding-3-small",
    dimensions=1536
)

# Define Pinecone index name
pinecone_index_name = "lease"

# Initialize Pinecone client
pc = Pinecone(api_key= pinecone_api_key)
index = pc.Index(pinecone_index_name)

# Initialize the vector store
vector_store = PineconeVectorStore(embedding=embeddings, index=index)

#--------------------------------------------------------------------------------------------------------------------------------------#
#UPLOADS THE LEASE TO VECTOR DATABASE
def upload_pdf_lease(pdf_path: str, pdf_id: int):
    # Load the single PDF document
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    all_splits = text_splitter.split_documents(documents)

    # And metadata to the split documents
    for doc in all_splits:
        #Add id to pdf so that if the user decides to upload multiple pdf's, the pdf id can be used to only search 
        #for that pdf in the vector database and not the other pdf's
        doc.metadata["pdf_id"] = pdf_id
    
    #Store the split documents in the vector database
    try:
        vector_store.add_documents(all_splits)
    except Exception as e:
        raise RuntimeError(f"Failed to upload documents to Pinecone: {e}")
    
    return "Pdf successfully uploaded"

#---------------------------------------------------------------------------------------------------------------------------------#