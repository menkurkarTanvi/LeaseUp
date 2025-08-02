from fastapi import FastAPI
from backend.routes import questions
from backend.routes import maps

from backend.routes import lease, spreadsheet
from backend.app.db.database import create_db
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pinecone import Pinecone, ServerlessSpec

#Create the database
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    create_db()
    yield
    # Shutdown code (optional)

app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(questions.router)
app.include_router(maps.router)
app.include_router(lease.router)
app.include_router(spreadsheet.router)

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI!"}


#Connects to the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# init once throughout the entire backend 
# def init_pinecone():
#     Pinecone.init(
#         api_key="PINEONE_API_KEY",
#         environment="PINECONE_ENVIRONMENT"  # or your env
#     )
#     return Pinecone.Index("your-index-name")
#uvicorn backend.app.main:app --reload